import {instance as globalContainer} from "../dependency-container";
import Frequency from '../types/frequency';

test("beforeResolution interceptor gets called correctly", () =>
{
    class Bar {}
    let interceptorCalled = false;
    globalContainer.beforeResolution(Bar, _ => { interceptorCalled = true; }, { frequency: Frequency.Once });
    globalContainer.resolve(Bar);

    expect(interceptorCalled).toBeTruthy();
});