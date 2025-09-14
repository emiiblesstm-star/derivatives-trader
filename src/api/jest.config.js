const baseConfigForPackages = require('../../jest.config.base');

module.exports = {
    ...baseConfigForPackages,
    moduleNameMapper: {
        '@deriv/utils': '<rootDir>/../../__mocks__/utils.mock.js',
        '@deriv-com/ui': '<rootDir>/../../__mocks__/deriv-com.ui.mock.js',
        '\\.css$': '<rootDir>/../../__mocks__/styleMock.js',
    },
};
