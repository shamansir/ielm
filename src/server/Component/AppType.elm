module Component.AppType exposing (render)

import List
import Html exposing (..)
import Html.Attributes exposing (class)


render : String -> Int -> (Int -> Html a) -> x -> Html a
render appName objectsCount objectRenderer _ =
    div [ class "comp_app" ]
        [ div [ class "comp_app_name" ] [ text appName ]
        , (List.range 0 (objectsCount - 1)
            |> List.map
                (\index ->
                    div [ class "comp_app_object" ] [ objectRenderer index ])
            |> div [ class "comp_app_objects" ])
        ]
