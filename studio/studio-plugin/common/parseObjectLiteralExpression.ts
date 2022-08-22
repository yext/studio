import { ObjectLiteralExpression } from 'ts-morph'
import vm from 'vm'

/**
 * This function takes in an {@link ObjectLiteralExpression} and returns it's data.
 *
 * It converts a js object string and converts it into an object using vm.runInNewContext,
 * which can be thought of as a safe version of `eval`. Note that we cannot use JSON.parse here,
 * because we are working with a js object not a JSON.
 *
 * Due to using the nodejs `vm` module this function can only be run on the server side.
 */
export default function parseObjectLiteralExpression<T>(
  objectLiteralExpression: ObjectLiteralExpression
): T {
  return vm.runInNewContext('(' + objectLiteralExpression.getText() + ')')
}
