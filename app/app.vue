<template>
    <NuxtLoadingIndicator/>
    <UApp>
        <NuxtLayout>
            <NuxtPage/>
        </NuxtLayout>
    </UApp>
</template>
<script setup lang="ts">
</script>

<style>
@reference "~/assets/css/main.css";

.page-enter-active,
.page-leave-active {
    transition: all 0.3s;
}
.page-enter-from,
.page-leave-to {
    opacity: 0;
    filter: blur(1rem);
}

.layout-enter-active,
.layout-leave-active {
    transition: all 0.3s;
}
.layout-enter-from,
.layout-leave-to {
    opacity: 0;
    filter: blur(1rem);
}

::-webkit-scrollbar {
    display: none; /* or width: 0 */
}

/* For Firefox */
html {
    scrollbar-width: none;
}

/* For IE/Edge */
body {
    -ms-overflow-style: none;
}

</style>