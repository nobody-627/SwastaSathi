export default class LogisticRegression {
  constructor(weights = [], bias = 0, featureNames = []) {
    this.weights = Array.isArray(weights) ? weights : []
    this.bias = Number.isFinite(bias) ? bias : 0
    this.featureNames = featureNames
  }

  sigmoid(z) {
    const clipped = Math.max(-50, Math.min(50, z))
    return 1 / (1 + Math.exp(-clipped))
  }

  dotProduct(a, b) {
    const size = Math.min(a.length, b.length)
    let sum = 0
    for (let i = 0; i < size; i += 1) {
      const av = Number.isFinite(a[i]) ? a[i] : 0
      const bv = Number.isFinite(b[i]) ? b[i] : 0
      sum += av * bv
    }
    return sum
  }

  predict(featureVector = []) {
    const z = this.dotProduct(this.weights, featureVector) + this.bias
    return this.sigmoid(z)
  }
}
