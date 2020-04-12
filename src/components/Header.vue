<template>
    <div id="AppHeader">
        <div class="container">
            <h1>{{ title }}</h1>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppHeader',
        computed: {
            title() {
                return this.$route.meta.title
            }
        }
    };
</script>

<style scoped>

</style>