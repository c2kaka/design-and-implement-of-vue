const app = document.getElementById("app");
// app.innerText = data.text;

const bucket = new WeakMap();

const data = { text: "hello, world", foo: 0, bar: 0 };

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
  activeEffect.deps.push(targetPropDeps);
}

function trigger(target, key) {
  const targetDeps = bucket.get(target);
  if (!targetDeps) {
    return;
  }

  const effects = targetDeps.get(key);
  const effectsToRun = new Set(effects);
  effectsToRun.forEach((fn) => {
    if (fn !== activeEffect) {
      fn();
    }
  });
}

let activeEffect;
let effectStack = [];
function effect(fn) {
  // activeEffect = fn;
  // fn();
  const effectFn = () => {
    cleanup(effectFn);
    activeEffect = effectFn;
    effectStack.push(effectFn);
    fn();
    effectStack.pop();
    activeEffect = effectStack[effectStack.length - 1];
  };

  effectFn.deps = [];
  effectFn();
}

function cleanup(effectFn) {
  for (let index = 0; index < effectFn.deps.length; index++) {
    const deps = effectFn.deps[index];
    deps.delete(effectFn);
  }
  effectFn.deps.length = 0;
}

/* 
cleanup和分支切换
obj.ok = true;
effect(() => {
  console.log("effect run");
  app.innerText = obj.ok ? obj.text : "not";
}); // 触发读取
setTimeout(() => {
  // obj.text = "hello, mini-vue";
  obj.ok = false;
  obj.text = "hello, vue3"; // no clean up
}, 1000);
*/

/* 嵌套effect */
// let foo, bar;
// effect(function effectFn1() {
//   console.log("effectFn1 execute");
//   effect( function effectFn2()  {
//     console.log("effectFn2 execute");
//     bar = obj.bar;
//   });
//   foo = obj.foo;
// });
//
// obj.foo = 2;

/* 避免无限递归 */
effect(() => {
  obj.foo++;
})
