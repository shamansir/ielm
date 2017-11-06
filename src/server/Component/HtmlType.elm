module Component.HtmlType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

render : Html a -> Html a
render html = div [ class "comp_html" ] [ html ]
