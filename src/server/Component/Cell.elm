module Component.Cell exposing
    ( renderBasic
    , render3dMeshAt
    , renderEntityAt
    , renderControllable
    , renderError
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

import WebGL exposing (Mesh, Entity)

type alias Time = Int

type alias InputId = Int

type Input
    = IInteger Int
    | IFloat Float
    | IText String
    | IBool Bool

type alias Inputs = Array.Array Input

type Action
    = UpdateInput InputId Input
    -- | NewFrame Time
    | MouseMove Mouse.Position
    | SetRefPosition Mouse.Position


renderBasic : (a -> Html Action) -> T.TypeAtom -> a -> Html Action
renderBasic valueRenderer atom value =
    div [ class "cell" ]
        [ [ T.render atom ] |> div [ class "cell_type" ]
        , [ valueRenderer value ] |> div [ class "cell_value" ]
        ]


render3dMeshAt : Maybe Mouse.Position -> T.TypeAtom -> Mesh (ThreeDViewer.Vertex v) -> Html Action
render3dMeshAt position atom mesh =
    mesh |> renderBasic (ThreeDViewer.withMeshAt position) atom


renderEntityAt : Maybe Mouse.Position -> T.TypeAtom -> Entity -> Html Action
renderEntityAt position atom entity =
    -- FIXME: add ability to avoid specifying perspective
    (\_ -> entity) |> renderBasic (ThreeDViewer.withEntityAt position) atom


renderControllable : (Inputs -> a -> Html Action) -> Inputs -> T.TypeAtom -> a -> Html Action
renderControllable valueRenderer inputs atom value =
    div [ class "cell" ]
        [ (Array.indexedMap renderInput inputs)
          |> Array.toList
          |> div [ class "cell_inputs" ]
        , [ valueRenderer inputs value ]
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
        IBool bool -> input
            [ type_ "checkbox", checked bool, toBoolInput index |> onInput ]
            [ ]


extractVal : Input -> String
extractVal i =
    case i of
        IInteger num -> toString num
        IFloat num -> toString num
        IText str -> str
        IBool bool -> toString bool


toIntInput : Int -> String -> Action
toIntInput index str =
    UpdateInput index (IInteger (String.toInt str |> Result.withDefault 0))


toFloatInput : Int -> String -> Action
toFloatInput index str =
    UpdateInput index (IFloat (String.toFloat str |> Result.withDefault 0.0))


toTextInput : Int -> String -> Action
toTextInput index str =
    UpdateInput index (IText str)


toBoolInput : Int -> String -> Action
toBoolInput index str =
    UpdateInput index (IBool
        (case str of
            "checked" -> True
            _ -> False))


useInputs : Inputs -> Html Action
useInputs inputs =
    inputs
        |> Array.map (\i -> span [] [ text (extractVal i) ])
        |> Array.toList
        |> div [ ]


renderError : String -> Html Action
renderError errorText =
    div [ class "cell_error" ]
        [ text errorText ]

-- view : Model -> Html Action
-- view inputs =
--     renderWithInput
--         inputs
--         useInputs
