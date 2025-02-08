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
        line_comment: $ => seq('//', /.*/),
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
            'impl', $._type, '{',
            repeat($.function_decl),
            '}'
        ),
        _generic_entry: $ => seq($.identifier, 
            optional(seq(
                ':', 'impl', $._type
            ))),
        generic_clause: $ => seq('::<', $._generic_entry, repeat(seq(',', $._generic_entry)) , '>'),
        _enum_item: $ => choice($.declaration, seq($.identifier, optional(seq('=', $.integer_literal)))),
        _class_item: $ => choice(
            seq($.declaration, optional(seq(optional(','), $._class_item))),
            seq($.impl_block, optional(seq(optional(','), $._class_item))),
            seq($.identifier, ':', $._type, optional(seq(',', $._class_item)))
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
        const_decl: $ => seq($.identifier, ':', 'const', $._type, '=', $._expression, ';'),
        class_struct_decl: $ => seq($.identifier, ':', choice('class', 'struct'),
            optional(seq(':', choice('&', seq('&', 'mut')))), optional($.generic_clause), '=', '{',
                optional($._class_item),
            '}'
        ),
        alias_decl: $ => seq($.identifier, ':', 'alias', optional($.generic_clause), '=', $._type, ';'),
        interface_decl: $ => seq($.identifier, ':', 'interface', optional($.generic_clause), '=', '{',
            repeat(seq(field("interface_item", $._function_no_body), ';')),
            '}'
        ),
        var_decl: $ => seq(
            $.identifier,
            ':',
            optional('mut'),
            optional($._type),
            '=',
            $._expression, ';'
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

        return_stat: $ => seq('return', optional($._expression), ';'),
        if_stat: $ => prec.left(seq('if', '(', $._expression, ')', $._statement, optional(seq('else', $._statement)))),
        cond_extract_stat: $ => prec.left(seq(
            'if', 
            '|', optional(choice('&', seq('&', 'mut'))), $.identifier, '|', 
            '(', $._expression, ')',
            $._statement,
            optional(seq('else', $._statement)))),
        block_stat: $ => seq('{', repeat(choice($.var_decl, $._statement)), '}'),
        while_stat: $ => seq('while', '(', $._expression, ')', $._statement),
        for_stat: $ => seq('for', '(', $.identifier, 'in', $._expression, ')', $._statement),
        with_stat: $ => seq('with', '(', $.identifier, 'as', $._expression, ')', $._statement),
        break_stat: $ => seq('break', ';'),
        continue_stat: $ => seq('continue', ';'),
        expr_stat: $ => seq($._expression, ';'),
        _expression: $ => choice(
            $.binary_expr,
            $.name_expr,
            $.integer_literal,
            $.float_literal,
            $.bool_literal,
            $.tuple_literal,
            $.group_expr,
            $.generic_name_expr,
            $.scope_expr,
            $.call_expr,
            $.cast_expr,
            $.obj_literal,
            $.gcnew_epxr,
            $.prefix_expr
        ),
        binary_expr: $ => choice(
            prec.left(10, seq($._expression, '+', $._expression)),
            prec.left(10, seq($._expression, '-', $._expression)),
            prec.left(11, seq($._expression, '*', $._expression)),
            prec.left(11, seq($._expression, '/', $._expression)),
            prec.left(11, seq($._expression, '%', $._expression)),
            prec.left(7, seq($._expression, '==', $._expression)),
            prec.left(7, seq($._expression, '!=', $._expression)),
            prec.left(8, seq($._expression, '>', $._expression)),
            prec.left(8, seq($._expression, '<', $._expression)),
            prec.left(8, seq($._expression, '>=', $._expression)),
            prec.left(8, seq($._expression, '<=', $._expression)),
            prec.left(8, seq($._expression, '<=>', $._expression)),
            prec.left(13, seq($._expression, '.', $._expression)),
            prec.left(9, seq($._expression, '>>', $._expression)),
            prec.left(9, seq($._expression, '<<', $._expression)),
            prec.left(4, seq($._expression, '|', $._expression)),
            prec.left(6, seq($._expression, '^', $._expression)),
            prec.left(5, seq($._expression, '&', $._expression)),
            prec.right(1, seq($._expression, '=', $._expression)),
            prec.right(1, seq($._expression, '+=', $._expression)),
            prec.right(1, seq($._expression, '-=', $._expression)),
            prec.right(1, seq($._expression, '/=', $._expression)),
            prec.right(1, seq($._expression, '*=', $._expression)),
            prec.right(1, seq($._expression, '|=', $._expression)),
            prec.right(1, seq($._expression, '%=', $._expression)),
            prec.right(1, seq($._expression, '*=', $._expression)),
            prec.right(1, seq($._expression, '^=', $._expression)),
            prec.left(3, seq($._expression, '&&', $._expression)),
            prec.left(2, seq($._expression, '||', $._expression)),
        ),
        prefix_expr: $ => seq(
            choice('-', '*', '&', '!', seq('&', 'mut')),
            $._expression
        ),
        name_expr: $ => $.identifier,
        cast_expr: $ => prec(12, seq($._expression, 'as', $._type)),
        generic_name_expr: $ => seq($.identifier, $._generic_args),
        scope_expr: $ => seq(choice($.generic_name_expr, $.name_expr), 
            repeat1(seq("::", choice($.generic_name_expr, $.name_expr)))),
        call_expr: $ => prec(13, seq($._expression, '(', 
            optional(seq($._expression, repeat(seq(',', $._expression)))), ')')),
        sub_expr: $ => prec(13, seq($._expression, '[', $._expression, ']')),
        integer_literal: $ => /\d+/,
        float_literal: $ => /\d+\.\d+/,
        bool_literal: $ => choice('false', 'true'),
        tuple_literal: $ => seq('(', 
            $._expression, 
            repeat1(seq(',', $._expression)), 
            ')'),
        group_expr: $ => seq('(', $._expression, ')'),
        _obj_lit_item: $ => seq('.', $.identifier, optional(seq('=', $._expression))),
        obj_literal: $ => seq(choice($.name_expr, $.generic_name_expr, $.scope_expr),
            '{', 
            optional(seq(
                $._obj_lit_item, optional(seq(',', $._obj_lit_item))
            )),
            '}'
        ),
        gcnew_epxr: $ => seq('gcnew', $._expression),
        _generic_args: $ => seq('::<', $._type, repeat(seq(',', $._type)), '>'),
        _type: $ => choice(
            $.primitive_type,
            $.identifier,
            $.array_type,
            $.group_type,
            $.tuple_type,
            $.variant_type,
            $.ref_type,
            $.ref_mut_type,
            $.optional_type,
            $.view_type,
            $.view_mut_type,
            $.gc_ref_type,
            $.generic_name_expr,
            $.scope_expr),
        primitive_type: $ => choice('i8', 'i16', 'i32', 'i64', 'u8', 'u16', 'u32', 'u64', 'f32', 'f64'),
        array_type: $ => seq('[', $._type, optional(seq(';', $.integer_literal)), ']'),
        group_type: $ => seq('(', $._type, ')'),
        tuple_type: $ => seq('(', $._type, repeat1(seq(',', $._type)), ')'),
        variant_type: $ => seq('(', $._type, repeat1(seq('|', $._type)), ')'),
        ref_type: $ => seq('&', $._type),
        ref_mut_type: $ => seq('&', 'mut', $._type),
        optional_type: $ => prec.left(1, seq($._type, '?')),
        view_type: $ => prec.left(1, seq($._type, ':', '&')),
        view_mut_type: $ => prec.left(1, seq($._type, ':', '&', 'mut')),
        gc_ref_type: $ => seq('^', $._type),
        
        _this_clause: $ => seq(optional(choice('&', seq('&', 'mut'))), 'this'),
        _param_list: $ => seq('(', 
            optional(
                seq(choice($._this_clause, seq($.identifier, ':', $._type)), 
                repeat(seq(',', $.identifier, ':', $._type)))
            ), 
        ')'),
        function_sig: $ => seq(
            choice(
                seq('->', $._type),
                $._param_list,
                seq($._param_list, seq('->', $._type))
            )
        ),
        identifier: $ => /[a-zA-Z][a-zA-Z0-9_]*/,
    }
});
