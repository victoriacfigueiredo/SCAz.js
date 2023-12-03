const { Runner } = require('../runner')

const ANALYSIS = 'override_assignment'

const runner = new Runner()

describe('Override Assignment Analysis Test Cases', () => {
    test.each([
        { testCase: 'example', conflict: true },
        { testCase: 'addition_to_array', conflict: true },
        { testCase: 'array_constant_diff_index', conflict: false },
        { testCase: 'array_constant_same_index', conflict: true },
        { testCase: 'array_class_field', conflict: false },
        { testCase: 'array_class_field_conflict', conflict: true },
        { testCase: 'base', conflict: false },
        { testCase: 'base_conflict', conflict: true },
        { testCase: 'both_marking', conflict: true },
        { testCase: 'call_graph', conflict: true },
        { testCase: 'chained_methods_call', conflict: true },
        { testCase: 'chained_params', conflict: true },
        { testCase: 'change_instance_attribute', conflict: true },
        { testCase: 'change_object_propagating_field', conflict: false },
        { testCase: 'change_public_attributes', conflict: true },
        { testCase: 'class_field', conflict: true },
        { testCase: 'class_field_2', conflict: true },
        { testCase: 'class_field_3', conflict: false },
        { testCase: 'class_field_4', conflict: false },
        { testCase: 'class_field_with_parameter', conflict: true },
        { testCase: 'concat_methods', conflict: true },
        { testCase: 'contains_invoke_exp', conflict: true },
        { testCase: 'default_constructor', conflict: true },
        { testCase: 'different_attribute_on_identical_class', conflict: false },
        { testCase: 'different_class_with_same_attribute', conflict: false },
        { testCase: 'different_method_on_identical_class', conflict: true },
        { testCase: 'hash_map', conflict: false },
        { testCase: 'if_branch', conflict: true },
        { testCase: 'if_with_invoke', conflict: true },
        { testCase: 'init_array', conflict: false },
        { testCase: 'local_array', conflict: false },
        { testCase: 'local_array_recursive', conflict: false },
        { testCase: 'local_variables', conflict: false },
        { testCase: 'local_variables_2', conflict: false },
        { testCase: 'local_variables_with_parameter', conflict: false },
    ])('$testCase, conflict: $conflict', ({ testCase, conflict }) => {
        const logSpy = jest.spyOn(console, 'log')
        runner.runAnalyses(ANALYSIS, testCase)
        const expected = conflict
            ? expect.stringContaining('Output')
            : expect.stringContaining('No output')
        expect(logSpy).toHaveBeenLastCalledWith(expected)
    })
})
