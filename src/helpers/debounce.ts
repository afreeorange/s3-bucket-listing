const debounce = <T extends (...args: Parameters<T>) => void>(
  func: T,
  timeout = 250,
): ((...args: Parameters<T>) => void) => {
  let timer: number | undefined;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      func(...args);
    }, timeout);
  };
};

export default debounce;
