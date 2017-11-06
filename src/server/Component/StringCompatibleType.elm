module Component.StringCompatibleType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

render : x -> Html a
render x = span [ class "comp_stringp" ] [ text (toString x) ]
