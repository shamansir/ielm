module Component.SimpleType exposing (render)

import Html exposing (..)

render : String -> Html a
render str = span [] [ text str ]
