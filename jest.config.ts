module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "test/.*": "<rootDir>/tests/$1",
    },
    resetMocks: true,
};
