("fn") @keyword.function
[
    "struct" 
    "class" 
    "interface"
    "enum"
] @keyword.type
[
    "while" 
    "for"
] @keyword.type
[
    "true"
    "false"
] @boolean
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
(null_literal) @constant
(line_comment) @comment
(scope_expr (name_expr)@type)
(expression (name_expr)@variable)
((identifier) @variable.builtin (#eq? @variable.builtin "this"))

(call_expr (expression (name_expr) @function.call))
(call_expr .(expression (scope_expr [
    (name_expr) @function.call
    (generic_name_expr) @function.call
].)))
(call_expr (expression (binary_expr (expression (name_expr)@function.call). )))
(call_expr (expression (binary_expr (expression (scope_expr [
    (name_expr) @function.call
    (generic_name_expr) @function.call
].)). )))
(type (identifier)@type)
(integer_literal)@number
(primitivetype)@type.builtin
(var_decl (identifier)@variable)
(function_decl .(identifier)@function)
(class_struct_decl (identifier)@variable.member)
(class_struct_decl .(identifier)@type)
(obj_literal .(name_expr)@type)
(obj_literal (identifier)@variable.member)
(string)@string
(enum_decl (identifier)@constant)
(enum_decl .(identifier)@type)
(class_struct_decl)
