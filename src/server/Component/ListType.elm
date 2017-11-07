module Component.ListType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

render : List x -> (x -> Html a) -> Html a
render list itemRenderer =
    div [ class "comp_list" ] [ html ]
