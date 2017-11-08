module Component.RecordType exposing (render)

import Html exposing (..)
import Html.Attributes exposing (class)

render : x -> (x -> Html a) -> Html a
render record recordRenderer =
    div [ class "comp_record" ]
        [ text "RECORD" ]
        -- [ record |> List.map itemTypeRenderer |> div [ class "comp_list_items" ] ]
