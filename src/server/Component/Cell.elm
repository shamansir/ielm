module Component.Cell exposing
    ( renderBasic
    , render3d
    , renderControllable
    , raw
    , Time
    , InputId
    , Input(..)
    , Inputs
    , Action(..)
    )

import Component.TypeType as T
import Component.ThreeDViewer as ThreeDViewer

import Array
import Mouse
import Window

import Html exposing (..)
import Html.Attributes exposing (..)
import Html.Events exposing (onInput)

import WebGL exposing (Mesh)

type alias Time = Int

type alias InputId = Int

type Input
    = IInteger Int
    | IFloat Float
    | IText String

type alias Inputs = Array.Array Input

type Action
    = UpdateInput InputId Input
    | NewFrame Time
    | MouseMove Mouse.Position

viewerSize = Window.Size 500 500

type Raw a = Raw a

raw : a -> Raw a
raw v = Raw v

renderBasic : (a -> Html Action) -> T.TypeAtom -> a -> Html Action
renderBasic valueRenderer atom value =
    div [ class "cell" ]
        [ [ T.render atom ] |> div [ class "cell_type" ]
        , [ valueRenderer value ] |> div [ class "cell_value" ]
        ]

render3d : Mouse.Position -> T.TypeAtom -> Mesh ThreeDViewer.Vertex -> Html Action
render3d position atom mesh =
    div [ class "cell" ]
        [ [ T.render atom ] |> div [ class "cell_type" ]
        , [ ThreeDViewer.withMesh position viewerSize mesh ] |> div [ class "cell_value" ]
        ]

renderControllable : (a -> Html Action) -> T.TypeAtom -> Inputs -> a -> Html Action
renderControllable valueRenderer atom inputs value =
    div [ class "cell" ]
        [ (Array.indexedMap renderInput inputs)
          |> Array.toList
          |> div [ class "cell_inputs" ]
        , [ valueRenderer value ]
          |> div [ class "cell_value" ]
        ]

renderInput : Int -> Input -> Html Action
renderInput index input_ =
    case input_ of
        IInteger num -> input
            [ type_ "range", step "1", toIntInput index |> onInput ]
            [ toString num |> text ]
        IFloat num -> input
            [ type_ "range", toFloatInput index |> onInput ]
            [ toString num |> text ]
        IText str -> input
            [ type_ "text", toTextInput index |> onInput ]
            [ text str ]

extractVal : Input -> String
extractVal i =
    case i of
        IInteger num -> toString num
        IFloat num -> toString num
        IText str -> str

toIntInput : Int -> String -> Action
toIntInput index str =
    UpdateInput index (IInteger (String.toInt str |> Result.withDefault 0))

toFloatInput : Int -> String -> Action
toFloatInput index str =
    UpdateInput index (IFloat (String.toFloat str |> Result.withDefault 0.0))

toTextInput : Int -> String -> Action
toTextInput index str =
    UpdateInput index (IText str)

useInputs : Inputs -> Html Action
useInputs inputs =
    inputs
        |> Array.map (\i -> span [] [ text (extractVal i) ])
        |> Array.toList
        |> div [ ]

-- view : Model -> Html Action
-- view inputs =
--     renderWithInput
--         inputs
--         useInputs
