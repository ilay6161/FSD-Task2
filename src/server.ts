import initApp from './app';

const PORT = process.env.PORT || 3000;

initApp().then((app) => {
  console.log("after init app.");
  app.listen(PORT, () => {
    console.log(`This app listening at http://localhost:${PORT}`);
  });
});