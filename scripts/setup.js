//setup.js

//simple scriptloader, thanks https://usefulangle.com/post/343/javascript-load-multiple-script-by-order
let loadScript = (url) => {
  return new Promise ( (resolve, reject) => {
    let script = document.createElement('script');
    script.src = url;
    script.async = false;
    script.onload = () => {
      resolve(url);
    };
    script.onerror = () => {
      reject(url);
    };
    document.body.appendChild(script);
  });
}


const scriptURLs = [
  'scripts/helpers.js',
  'scripts/config.js',
  'scripts/particle.js',
  'scripts/spot.js',
  'scripts/main.js'
];


let promises = [];

for (let i = 0, l = scriptURLs.length - 1; i < l; i++) {
  promises.push(loadScript(scriptURLs[i]));
}

Promise.all(promises)
.then( () => {
    loadScript(scriptURLs[scriptURLs.length - 1])
    .then( () => {
      console.log('all scripts loaded');
    })
    .catch( () => {
      console.log('main script not loaded');
    });
})
.catch ((script) => {
  console.log(script + ' failed to load');
});
