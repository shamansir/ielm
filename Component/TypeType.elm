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
    | Alias TypeAtom (List TypeAtom)
    | Record (List (String, TypeAtom))

render : TypeAtom -> Html msg
render atom =
    case atom of
        Name n -> span [ class "type_atom" ] [ text n ]
        Variable v -> span [ class "type_var" ] [ text v ]
        Lambda left right ->
            div [ class "type_lambda" ]
                [ render left, render right ]
        Application subj obj ->
            div [ class "type_app" ]
                ((render subj) :: (obj |> List.map render))
        Alias def list ->
            div [ class "type_aliased" ]
                ((render def) :: (list |> List.map render))
        Record fields ->
            div [ class "type_record" ]
                (fields |> List.map renderField)

renderField : (String, TypeAtom) -> Html msg
renderField ( name, atom ) =
    span [ class "record_field" ]
        [ span [ class "field_name" ] [ text name ]
        , span [ class "field_value" ] [ render atom ]
        ]
