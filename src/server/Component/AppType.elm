module Component.AppType exposing
    ( render
    , renderMaybe
    , renderResult
    )

import List
import Html exposing (..)
import Html.Attributes exposing (class)


render : String -> Int -> (Int -> x -> Html a) -> x -> Html a
render appName objectsCount objectRenderer item =
    div [ class "comp_app" ]
        [ div [ class "comp_app_name" ] [ text appName ]
        , (List.range 0 (objectsCount - 1)
            |> List.map
                (\index ->
                    div [ class "comp_app_object" ] [ item |> objectRenderer index ])
            |> div [ class "comp_app_objects" ])
        ]


renderMaybe : (x -> Html a) -> Maybe x -> Html a
renderMaybe renderJust maybeVal =
    div [ class "comp_app comp_app--maybe" ]
        [ div [ class "comp_app_name" ] [ text "Maybe" ]
        , case maybeVal of
            Just v -> div [ class "comp_app_object" ]
                          [ span [ class "comp_app_variant" ] [ text "Just" ]
                          , renderJust v
                          ]
            Nothing -> div [ class "comp_app_object comp_app--failure-text" ]
                           [ span [ class "comp_app_variant" ] [ text "Nothing" ]
                           ]
        ]


renderResult : (err -> Html a) -> (ok -> Html a) -> Result err ok -> Html a
renderResult renderErr renderOk resultVal =
    div [ class "comp_app comp_app--result" ]
        [ div [ class "comp_app_name" ] [ text "Result" ]
        , case resultVal of
            Ok v -> div [ class "comp_app_object" ]
                        [ span [ class "comp_app_variant" ] [ text "Ok" ]
                        , renderOk v
                        ]
            Err e -> div [ class "comp_app_object comp_app--failure" ]
                         [ span [ class "comp_app_variant" ] [ text "Err" ]
                         , renderErr e
                         ]
        ]
