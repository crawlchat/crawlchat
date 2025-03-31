export function effect(promise: Promise<any>) {
  promise.catch(() => {
    console.log("Effect failed!")
  });
}
