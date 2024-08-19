const app = document.getElementById("app");
// app.innerText = data.text;

const bucket = new Set();

const data = { text: "hello, world" };

const obj = new Proxy(data, {
  get(target, key) {
    bucket.add(effect);
    return target[key];
  },
  set(target, key, newValue) {
    target[key] = newValue;
    bucket.forEach((fn) => fn());
    return true;
  },
});

function effect() {
  app.innerText = obj.text;
}

effect(); // 触发读取

setTimeout(() => {
  obj.text = "hello, mini-vue";
}, 1000);
