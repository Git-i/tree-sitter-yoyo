/**
 * @file Parser for yoyo
 * @author Eric <eric.nwogbo1@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
    name: "yoyo",
    extras: $ => [
        /\s/,
        $.line_comment,
    ],
    word: $ => $.identifier,
    rules: {
    // For now operator overload is module scoped
        source_file: $ => repeat(choice($.declaration, $.operator_overload)),
        line_comment: $ => /\/\/.*/,
        attr_list: $ => seq('#(', $.identifier, repeat(seq(',', $.identifier)), ')'),
        declaration: $ => seq(
            optional($.attr_list),
            choice($.function_decl, 
                $.alias_decl, 
                $.const_decl, 
                $.enum_decl, 
                $.class_struct_decl,
                $.interface_decl)),
        _function_no_body: $ =>seq(
            $.identifier,
            ':',
            'fn',
            optional($.generic_clause),
            optional($.function_sig)),
        function_decl: $ => seq(
            $._function_no_body,
            '=',
            $._statement
        ),
        impl_block: $ => seq(
            'impl', $.type, '{',
            repeat($.function_decl),
            '}'
        ),
        _generic_entry: $ => seq($.identifier, 
            optional(seq(
                ':', 'impl', $.type
            ))),
        generic_clause: $ => seq('::<', $._generic_entry, repeat(seq(',', $._generic_entry)) , '>'),
        _enum_item: $ => choice($.declaration, seq($.identifier, optional(seq('=', $.integer_literal)))),
        _class_item: $ => choice(
            seq($.declaration, optional(seq(optional(','), $._class_item))),
            seq($.impl_block, optional(seq(optional(','), $._class_item))),
            seq($.identifier, ':', $.type, optional(seq(',', $._class_item)))
        ),
        enum_decl: $ => seq($.identifier, ':', 'enum', '=', '{',
            optional(seq(
                $._enum_item,
                repeat(seq(',', $._enum_item)),
                optional(','),
            )),
            '}'
        ),
        operator_overload: $ => seq('operator', ':',
            choice('+', '-', '/', '*', '%', '&', '|', '^', '<=>', '<<', '>>'),
            $.function_sig, '=', $._statement
        ),
        const_decl: $ => seq($.identifier, ':', 'const', $.type, '=', $.expression, ';'),
        class_struct_decl: $ => seq($.identifier, ':', choice('class', 'struct'),
            optional(seq(':', choice('&', seq('&', 'mut')))), optional($.generic_clause), '=', '{',
                optional($._class_item),
            '}'
        ),
        alias_decl: $ => seq($.identifier, ':', 'alias', optional($.generic_clause), '=', $.type, ';'),
        interface_decl: $ => seq($.identifier, ':', 'interface', optional($.generic_clause), '=', '{',
            repeat(seq(field("interface_item", $._function_no_body), ';')),
            '}'
        ),
        var_decl: $ => seq(
            $.identifier,
            ':',
            optional('mut'),
            optional($.type),
            '=',
            $.expression, ';'
        ),
        _statement: $ => choice(
            $.return_stat, 
            $.if_stat, 
            $.cond_extract_stat,
            $.block_stat,
            $.while_stat,
            $.for_stat,
            $.with_stat,
            $.break_stat,
            $.continue_stat,
            $.expr_stat
        ),

        return_stat: $ => seq('return', optional($.expression), ';'),
        if_stat: $ => prec.left(seq('if', '(', $.expression, ')', $._statement, optional(seq('else', $._statement)))),
        cond_extract_stat: $ => prec.left(seq(
            'if', 
            '|', optional(choice('&', seq('&', 'mut'))), $.identifier, '|', 
            '(', $.expression, ')',
            $._statement,
            optional(seq('else', $._statement)))),
        block_stat: $ => seq('{', repeat(choice($.var_decl, $._statement)), '}'),
        while_stat: $ => seq('while', '(', $.expression, ')', $._statement),
        for_stat: $ => seq('for', '(', $.identifier, 'in', $.expression, ')', $._statement),
        with_stat: $ => seq('with', '(', $.identifier, 'as', $.expression, ')', $._statement),
        break_stat: $ => seq('break', ';'),
        continue_stat: $ => seq('continue', ';'),
        expr_stat: $ => seq($.expression, ';'),
        expression: $ => choice(
            $.binary_expr,
            $.name_expr,
            $.integer_literal,
            $.float_literal,
            $.bool_literal,
            $.null_literal,
            $.tuple_literal,
            $.group_expr,
            $.generic_name_expr,
            $.scope_expr,
            $.call_expr,
            $.sub_expr,
            $.cast_expr,
            $.obj_literal,
            $.gcnew_epxr,
            $.prefix_expr,
            $.string,
            $.char_literal,
            $.array_literal
        ),
        binary_expr: $ => choice(
            prec.left(10, seq($.expression, '+', $.expression)),
            prec.left(10, seq($.expression, '-', $.expression)),
            prec.left(11, seq($.expression, '*', $.expression)),
            prec.left(11, seq($.expression, '/', $.expression)),
            prec.left(11, seq($.expression, '%', $.expression)),
            prec.left(7, seq($.expression, '==', $.expression)),
            prec.left(7, seq($.expression, '!=', $.expression)),
            prec.left(8, seq($.expression, '>', $.expression)),
            prec.left(8, seq($.expression, '<', $.expression)),
            prec.left(8, seq($.expression, '>=', $.expression)),
            prec.left(8, seq($.expression, '<=', $.expression)),
            prec.left(8, seq($.expression, '<=>', $.expression)),
            prec.left(13, seq($.expression, '.', $.expression)),
            prec.left(9, seq($.expression, '>>', $.expression)),
            prec.left(9, seq($.expression, '<<', $.expression)),
            prec.left(4, seq($.expression, '|', $.expression)),
            prec.left(6, seq($.expression, '^', $.expression)),
            prec.left(5, seq($.expression, '&', $.expression)),
            prec.right(1, seq($.expression, '=', $.expression)),
            prec.right(1, seq($.expression, '+=', $.expression)),
            prec.right(1, seq($.expression, '-=', $.expression)),
            prec.right(1, seq($.expression, '/=', $.expression)),
            prec.right(1, seq($.expression, '*=', $.expression)),
            prec.right(1, seq($.expression, '|=', $.expression)),
            prec.right(1, seq($.expression, '%=', $.expression)),
            prec.right(1, seq($.expression, '*=', $.expression)),
            prec.right(1, seq($.expression, '^=', $.expression)),
            prec.left(3, seq($.expression, '&&', $.expression)),
            prec.left(2, seq($.expression, '||', $.expression)),
        ),
        prefix_expr: $ => seq(
            choice('-', '*', '&', '!', seq('&', 'mut')),
            $.expression
        ),
        string: $ => /\".*\"/,
        char_literal: $ => /\'.\'/,
        name_expr: $ => $.identifier,
        cast_expr: $ => prec(12, seq($.expression, 'as', $.type)),
        generic_name_expr: $ => seq($.identifier, $._generic_args),
        scope_expr: $ => prec.left(14, seq(choice($.generic_name_expr, $.name_expr), 
            repeat1(seq("::", choice($.generic_name_expr, $.name_expr))))),
        call_expr: $ => prec(13, seq($.expression, '(', 
            optional(seq($.expression, repeat(seq(',', $.expression)))), ')')),
        sub_expr: $ => prec(13, seq($.expression, '[', $.expression, ']')),
        integer_literal: $ => /\d+/,
        float_literal: $ => /\d+\.\d+/,
        bool_literal: $ => choice('false', 'true'),
        null_literal: $ => "null",
        tuple_literal: $ => seq('(', 
            $.expression, 
            repeat1(seq(',', $.expression)), 
            ')'),
        group_expr: $ => seq('(', $.expression, ')'),
        _obj_lit_item: $ => seq('.', $.identifier, optional(seq('=', $.expression))),
        obj_literal: $ => seq(choice($.name_expr, $.generic_name_expr, $.scope_expr),
            '{', 
            optional(seq(
                $._obj_lit_item, optional(seq(',', $._obj_lit_item))
            )),
            '}'
        ),
        array_literal: $ => seq('[', optional(
            seq($.expression, repeat(seq(',', $.expression)), optional(','))
        ), ']'),
        gcnew_epxr: $ => seq('gcnew', $.expression),
        _generic_args: $ => seq('::<', $.type, repeat(seq(',', $.type)), '>'),
        type: $ => choice(
            $.primitivetype,
            $.identifier,
            $.arraytype,
            $.grouptype,
            $.tupletype,
            $.varianttype,
            $.reftype,
            $.ref_muttype,
            $.optionaltype,
            $.viewtype,
            $.view_muttype,
            $.gc_reftype,
            $.generic_name_expr,
            $.scope_expr),
        primitivetype: $ => choice('i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64', 'f32', 'f64'),
        arraytype: $ => seq('[', $.type, optional(seq(';', $.integer_literal)), ']'),
        grouptype: $ => seq('(', $.type, ')'),
        tupletype: $ => seq('(', $.type, repeat1(seq(',', $.type)), ')'),
        varianttype: $ => seq('(', $.type, repeat1(seq('|', $.type)), ')'),
        reftype: $ => seq('&', $.type),
        ref_muttype: $ => seq('&', 'mut', $.type),
        optionaltype: $ => prec.left(1, seq($.type, '?')),
        viewtype: $ => prec.left(1, seq($.type, ':', '&')),
        view_muttype: $ => prec.left(1, seq($.type, ':', '&', 'mut')),
        gc_reftype: $ => seq('^', $.type),
        
        _this_clause: $ => seq(optional(choice('&', seq('&', 'mut'))), 'this'),
        _param_list: $ => seq('(', 
            optional(
                seq(choice($._this_clause, seq($.identifier, ':', $.type)), 
                repeat(seq(',', $.identifier, ':', $.type)))
            ), 
        ')'),
        function_sig: $ => seq(
            choice(
                seq('->', $.type),
                $._param_list,
                seq($._param_list, seq('->', $.type))
            )
        ),
        identifier: $ => /[a-zA-Z][a-zA-Z0-9_]*/,
    }
});
