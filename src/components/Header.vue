<template>
    <div id="AppHeader">
        <div class="container">
            <h1 v-if="title">{{ title }}</h1>
            <p v-if="body">{{ body }}</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'AppHeader',
        computed: {
            title() {
                return this.$route.meta.title
            },
            body() {
                return this.$route.meta.body
            }
        }
    };
</script>

<style scoped>
.container {
    padding: 3px 10px 0px 10px;
}
</style>