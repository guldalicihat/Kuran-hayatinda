// Kaydırma pozisyonunu localStorage'a yazan fonksiyonlar her 'scroll' olayında
// (fare tekerleğiyle kaydırırken saniyede onlarca kez) senkron JSON.parse/stringify +
// setItem çalıştırıyordu; bu bazı Windows makinelerinde ana iş parçacığını kilitleyip
// kaydırmayı donuyormuş gibi hissettiriyor. fn, en fazla ms aralıkla çalışır.
export function throttle<A extends unknown[]>(fn: (...args: A) => void, ms: number): (...args: A) => void {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let pending: A | undefined
  return (...args: A) => {
    const now = Date.now()
    const remaining = ms - (now - last)
    if (remaining <= 0) {
      last = now
      fn(...args)
    } else {
      pending = args
      clearTimeout(timer)
      timer = setTimeout(() => {
        last = Date.now()
        if (pending) fn(...pending)
      }, remaining)
    }
  }
}
