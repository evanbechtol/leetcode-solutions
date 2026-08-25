import { registerTraceProducer } from '../registry'
import { produceBinarySearchTrace } from './binarySearch'
import { produceTwoSumTrace } from './twoSum'

let registered = false

export const registerPilotTraceFixtures = () => {
  if (registered) return
  registerTraceProducer(1, produceTwoSumTrace)
  registerTraceProducer(704, produceBinarySearchTrace)
  registered = true
}
