const app = document.getElementById("app");
// app.innerText = data.text;

const bucket = new WeakMap();

const data = { text: "hello, world" };

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newValue) {
    target[key] = newValue;
    trigger(target, key);
    return true;
  },
});

function track(target, key) {
  if (!activeEffect) {
    return;
  }

  let targetDeps = bucket.get(target);
  if (!targetDeps) {
    targetDeps = new Map();
    bucket.set(target, targetDeps);
  }

  let targetPropDeps = targetDeps.get(key);
  if (!targetPropDeps) {
    targetPropDeps = new Set();
    targetDeps.set(key, targetPropDeps);
  }

  targetPropDeps.add(activeEffect);
}

function trigger(target, key) {
  const targetDeps = bucket.get(target);
  if (!targetDeps) {
    return;
  }

  const effects = targetDeps.get(key);
  effects &&
    effects.forEach((effect) => {
      effect();
    });
}

let activeEffect;
function effect(fn) {
  activeEffect = fn;
  fn();
}

effect(() => {
  console.log("effect run");
  app.innerText = obj.text;
}); // 触发读取

setTimeout(() => {
  // obj.text = "hello, mini-vue";
  obj.notExist = "hello, mini-vue";
}, 1000);
