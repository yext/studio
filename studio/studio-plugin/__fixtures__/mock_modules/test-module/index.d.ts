import { ReactElement } from 'react';

/**
 * Test Component!
 *
 * @public
 */
export declare function TestComponent(props: TestComponentProps): ReactElement;

/**
 * props interface for TestComponent
 * @public
 */
export declare interface TestComponentProps {
    /** some random text */
    randomText: string;
    /** a random number! */
    randomNum: number;
}
