class RandomSequence {
    // static seed: number = 0;
    // static random = Math.random;
    static randomBinarySequence = [true, false, false, true,false, true, true, false, true, false, false, true, true, true];
    static loc = 0;
    static getNextRandom(): boolean {
        let val = RandomSequence.randomBinarySequence[RandomSequence.loc];
        RandomSequence.loc = (RandomSequence.loc + 1) % RandomSequence.randomBinarySequence.length;
        return val;
    }
}

export { RandomSequence };