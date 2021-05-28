<template>
  <div class="container">
    <div class="inner">
      <h2>Contact Map correlates your location with reported data</h2>
      <p>Contact Map is designed to allow you to correlate your locations at different times to reported cases by areas.</p>
      <p>It uses public data and combines it with data you upload to allow you to see where you were, in relation to the cases reported over the same times.</p>
      <p>The dots you see on the map are places you stopped at, and the lines show how you got between places. Hover over the dots and lines to see a description. This is all derived from your Google Takeout data.</p>
      <p><img src="img/sample.jpg" width="960" height="601" alt="sample of UI" /></p>
      <h2>Contact Map doesn't store your private data</h2>
      <p>With Contact Map, you are completely in control of your own data.</p>
      <p>When you upload your Google Takeout Location data to Contact Map, we transform it for use on Contact Map, but we never store your data on our servers, nor do we keep any record of your data.</p>
      <p>Once you close your browser, your data is gone!</p>
      <h2>Contact Map case data</h2>
      <p>Contact Map ingests data from a number of sources, including the Guardian, Government health authorities and various other places. While best efforts are made to ensure the data is accurate, no guarantees are offered.</p>
      <p>Australian Governments need to get their acts together and provide good consistent data APIs for critical data that can benefit the community. Hassle your MP.</p>
      <p>Use at your own risk, may contain traces of nuts, etc.</p>
      <h2>Terms of Use</h2>
      <p>You are permitted to use this service for your own personal use and entertainment. It must not be construed as medical advice, or used as such.</p>
      <p>
        Developers are welcome to use the APIs provided as part of this application in their own apps, however they must do so responsibly and access may be withdrawn if it is misued/overused. Please cache copies of the data from these APIs if you
        expect to need to make more than 100 requests per minute.
      </p>
    </div>
  </div>
</template>
<script>
  export default {
    name: "About",
    props: [],
  };
</script>

<style scoped>
  h2 {
    margin: 6px 0px;
  }
  p {
    margin: 6px 0px;
  }
  img {
    border: 1px solid #2d3e50;
    box-shadow: 2px 2px 8px 0px rgba(45, 62, 80, 0.6);
    margin: 6px 0px;
  }
  .container {
    padding: 10px 15px;
    border: 0px solid #5c7ea3;
    border-radius: 0px;
    background-color: #beccda;
    color: #333333;
    margin: 0px;
  }
  .inner {
    max-width: 960px;
    margin-left: auto;
    margin-right: auto;
  }
</style>
