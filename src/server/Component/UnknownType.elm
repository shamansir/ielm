module Component.UnknownType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

render : x -> Html a
render _ = span [ class "comp_unknown" ] [ text "No renderer" ]
