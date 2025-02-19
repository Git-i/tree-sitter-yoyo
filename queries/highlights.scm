("fn") @keyword.function
[
    "struct" 
    "class" 
    "interface"
    "enum"
    "union"
] @keyword.type
[
    "while" 
    "for"
] @keyword.type
[
    "if"
    "else"
] @keyword.conditional
[
    "return" 
    "break"
    "continue"
]@keyword.return
[
    "const"
    "mut"
]@keyword.modifier
"this"@variable.builtin
(null_literal) @constant
(line_comment) @comment
(scope_expr (name_expr)@type)

(bool_literal)@boolean
(expression (name_expr)@variable)
((identifier) @variable.builtin (#eq? @variable.builtin "this"))
(binary_expr (_) "." (expression (name_expr))@variable.member)

(call_expr (expression (name_expr) @function.call))
(call_expr (expression (binary_expr (expression (name_expr)@function.call). )))

(type (identifier)@type)
(integer_literal)@number
(primitivetype)@type.builtin
(var_decl (identifier)@variable)
(function_decl .(identifier)@function)

(class_struct_decl .(identifier)@type)
(class_struct_decl (_) (identifier)@variable.memeber)

(obj_literal .(name_expr)@type)
(obj_literal (identifier)@variable.member)
(string)@string
(enum_decl .(identifier)@type)
(enum_decl (_) (identifier)@constant)

(union_decl .(identifier)@type)
(union_decl (_) (identifier)@constant)
(cond_extract_stat (identifier)@variable)
