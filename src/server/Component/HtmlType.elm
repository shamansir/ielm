module Component.HtmlType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

import Component.Cell as Cell

render : Html a -> Html Cell.Action
render html = div [ class "comp_html" ] [ html ] |> Html.map (always Cell.NoOp)
