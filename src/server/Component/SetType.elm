module Component.SetType exposing (render)

import Set exposing (Set)

import Html exposing (..)
import Html.Attributes exposing (class)

render : (comparable -> Html a) -> Set comparable -> Html a
render itemTypeRenderer set =
    div [ class "comp_set" ]
        [ set
          |> Set.toList
          |> List.map (renderItem itemTypeRenderer)
          |> div [ class "comp_set_items" ]
        ]


renderItem : (comparable -> Html a) -> comparable -> Html a
renderItem itemTypeRenderer item =
    div [ class "comp_set_item" ] [ itemTypeRenderer item ]
