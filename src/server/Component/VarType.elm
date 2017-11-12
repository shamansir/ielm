module Component.VarType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

render : String -> x -> Html a
render name _ =
    div [ class "comp_var" ]
        [ div [ class "comp_var_name" ] [ text name ] ]
