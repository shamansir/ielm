module Component.AliasType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

render : String -> (x -> Html a) -> x -> Html a
render name itemTypeRenderer item =
    div [ class "comp_alias" ]
        [ div [ class "comp_alias_name" ] [ text name ]
        , div [ class "comp_alias_item" ] [ itemTypeRenderer item ]
        ]
