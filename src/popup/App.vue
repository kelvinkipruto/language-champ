<template>
  <v-app>
    <div>
      <v-app-bar color="primary" dense> </v-app-bar>
    </div>
  </v-app>
</template>

<script>
export default {
  name: "App",

  data() {
    return {
      status: "active",
      title: "Language champion ext",
    };
  },
};
</script>

<style>
html {
  width: 400px;
  height: 600px;
}
</style>
