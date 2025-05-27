import * as CRC32 from 'crc-32';

export class Png {
    static uint8 = new Uint8Array(4);
    static int32 = new Int32Array(Png.uint8.buffer);
    static uint32 = new Uint32Array(Png.uint8.buffer);

    static decodeText(data: Uint8Array): { keyword: string, text: string } {
        let naming = true;
        let keyword = '';
        let text = '';

        for (let index = 0; index < data.length; index++) {
            const code = data[index];

            if (naming) {
                if (code) {
                    keyword += String.fromCharCode(code);
                } else {
                    naming = false;
                }
            } else {
                text += String.fromCharCode(code || 0);
            }
        }
        return { keyword, text };
    }

    static encodeText(keyword: string, text: string): Uint8Array {
        keyword = String(keyword);
        text = String(text); // This text is expected to be Base64 encoded JSON

        if (keyword.includes('\0')) throw new Error('0x00 character is not permitted in tEXt keywords');
        if (keyword.length > 79 || keyword.length < 1) {
            // PNG spec is 1-79 chars for keyword, Latin-1, no leading/trailing/consecutive spaces.
            // For simplicity, we're a bit more lenient here, but strict checking is good.
            console.warn(`Keyword "${keyword}" length is ${keyword.length}, PNG spec recommends 1-79.`);
        }

        const data = new Uint8Array(keyword.length + text.length + 1); // +1 for the null separator
        let idx = 0;

        for (let i = 0; i < keyword.length; i++) {
            data[idx++] = keyword.charCodeAt(i);
        }
        data[idx++] = 0; // Null separator
        for (let i = 0; i < text.length; i++) {
            data[idx++] = text.charCodeAt(i); // Text is Base64, charCodeAt is fine
        }
        return data;
    }

    static readChunk(data: Uint8Array, idx: number): { type: string, data: Uint8Array, crc: number } {
        Png.uint8[3] = data[idx++];
        Png.uint8[2] = data[idx++];
        Png.uint8[1] = data[idx++];
        Png.uint8[0] = data[idx++];
        const length = Png.uint32[0] || 0;
        const chunkType = String.fromCharCode(data[idx++], data[idx++], data[idx++], data[idx++]);
        const chunkData = data.slice(idx, idx + length);
        idx += length;
        Png.uint8[3] = data[idx++];
        Png.uint8[2] = data[idx++];
        Png.uint8[1] = data[idx++];
        Png.uint8[0] = data[idx++];
        const crc = Png.int32[0];
        const expectedCrc = CRC32.buf(chunkData, CRC32.str(chunkType));
        if (crc !== expectedCrc) {
            console.warn(`CRC mismatch for "${chunkType}". Expected ${expectedCrc}, got ${crc}. Proceeding.`);
        }
        return { type: chunkType, data: chunkData, crc };
    }

    static readChunks(data: Uint8Array): { type: string, data: Uint8Array, crc?: number }[] {
        if (data[0] !== 0x89 || data[1] !== 0x50 || data[2] !== 0x4E || data[3] !== 0x47 || data[4] !== 0x0D || data[5] !== 0x0A || data[6] !== 0x1A || data[7] !== 0x0A) throw new Error('Invalid PNG header');
        const chunks: { type: string, data: Uint8Array, crc?: number }[] = [];
        let idx = 8;
        while (idx < data.length) {
            const chunk = Png.readChunk(data, idx);
            chunks.push(chunk);
            idx += 4 + 4 + chunk.data.length + 4;
            if (chunk.type === 'IEND') break;
        }
        if (!chunks.length || (chunks[chunks.length-1]?.type !== 'IEND' && chunks.find(c => c.type === 'IEND') === undefined) ) {
            throw new Error('PNG missing IEND or ended prematurely.');
        }
        return chunks;
    }

    static encodeChunks(chunks: { type: string, data: Uint8Array, crc?: number }[]): Uint8Array {
        const output = new Uint8Array(chunks.reduce((a, c) => a + 4 + 4 + c.data.length + 4, 8));
        output[0] = 0x89; output[1] = 0x50; output[2] = 0x4E; output[3] = 0x47; output[4] = 0x0D; output[5] = 0x0A; output[6] = 0x1A; output[7] = 0x0A;
        let idx = 8;
        chunks.forEach(c => {
            Png.uint32[0] = c.data.length;
            output[idx++] = Png.uint8[3]; output[idx++] = Png.uint8[2]; output[idx++] = Png.uint8[1]; output[idx++] = Png.uint8[0];
            output[idx++] = c.type.charCodeAt(0); output[idx++] = c.type.charCodeAt(1); output[idx++] = c.type.charCodeAt(2); output[idx++] = c.type.charCodeAt(3);
            output.set(c.data, idx);
            idx += c.data.length;
            Png.int32[0] = c.crc || CRC32.buf(c.data, CRC32.str(c.type));
            output[idx++] = Png.uint8[3]; output[idx++] = Png.uint8[2]; output[idx++] = Png.uint8[1]; output[idx++] = Png.uint8[0];
        });
        return output;
    }

    static Parse(arrayBuffer: ArrayBuffer, targetKeyword: string = "chara"): string {
        const chunks = Png.readChunks(new Uint8Array(arrayBuffer));
        const textChunks = chunks.filter(c => c.type === 'tEXt').map(c => Png.decodeText(c.data));
        if (textChunks.length < 1) throw new Error('No PNG text fields found in file');
        const targetTextChunk = textChunks.find(t => t.keyword === targetKeyword);
        if (targetTextChunk === undefined) throw new Error(`No PNG text field named "${targetKeyword}" found in file`);
        try {
            const binaryString = atob(targetTextChunk.text);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return new TextDecoder().decode(bytes);
        } catch (e) {
            throw new Error(`Unable to parse "${targetKeyword}" field as base64 or decode it: ${e}`);
        }
    }

    static Generate(arrayBuffer: Uint8Array<ArrayBufferLike>, jsonStringToEmbed: string, keyword: string = "chara"): Uint8Array {
        let chunks = Png.readChunks(arrayBuffer);
        chunks = chunks.filter(c => {
            if (c.type === 'tEXt') {
                try {
                    const decoded = Png.decodeText(c.data);
                    return decoded.keyword !== keyword;
                } catch (e) { return true; }
            }
            return true;
        });

        const utf8Bytes = new TextEncoder().encode(jsonStringToEmbed);
        const binaryString = utf8Bytes.reduce((str, byte) => str + String.fromCharCode(byte), '');
        const base64EncodedJson = btoa(binaryString);
        const newTextChunkData = Png.encodeText(keyword, base64EncodedJson);
        const iendIndex = chunks.findIndex(c => c.type === 'IEND');
        if (iendIndex === -1) throw new Error("Malformed PNG: IEND chunk not found.");
        chunks.splice(iendIndex, 0, { type: 'tEXt', data: newTextChunkData });
        return Png.encodeChunks(chunks);
    }
}
