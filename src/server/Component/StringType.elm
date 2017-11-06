module Component.StringType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

render : String -> Html a
render str = span [ class "comp_string" ] [ text str ]
