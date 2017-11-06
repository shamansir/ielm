module Component.TypeType exposing (render, TypeAtom(..))

-- See https://github.com/shamansir/node-elm-repl/blob/master/Types.md as a reference

import List
import Html exposing (..)
import Html.Attributes exposing (..)

type TypeAtom
    = Name String
    | Variable String
    | Lambda TypeAtom TypeAtom
    | Application TypeAtom (List TypeAtom)
    | Alias String (List TypeAtom)
    | MessageAlias String String
    | Record (List (String, TypeAtom))

render : TypeAtom -> Html msg
render atom =
    case atom of
        Name n -> span [ class "type_atom" ] [ text n ]
        Variable v -> span [ class "type_var" ] [ text v ]
        Lambda left right ->
            div [ class "type_lambda" ]
                [ div [ class "lambda_left" ] [ render left ]
                , div [ class "lambda_right" ] [ render right ]
                ]
        Application subj obj ->
            div [ class "type_app" ]
                [ div [ class "app_subj" ] [ render subj ]
                , div [ class "app_obj" ] (obj |> List.map render)
                ]
        Alias name list ->
            div [ class "type_aliased" ]
                [ span [ class "aliased_def" ] [ text name ]
                , div [ class "aliased_list" ] (list |> List.map render)
                ]
        MessageAlias name msgvar ->
            div [ class "type_aliased type_aliased--message" ]
                [ span [ class "aliased_def" ] [ text name ]
                , span [ class "aliased_msg" ] [ text msgvar ]
                ]
        Record fields ->
            div [ class "type_record" ]
                [ div [ class "record_fields" ] (fields |> List.map renderField)
                ]

renderField : (String, TypeAtom) -> Html msg
renderField ( name, atom ) =
    span [ class "record_field" ]
        [ span [ class "field_name" ] [ text name ]
        , span [ class "field_value" ] [ render atom ]
        ]
