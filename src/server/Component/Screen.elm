module Component.Screen exposing
    ( CellId
    , Model
    , init
    , update
    , subscribe
    )

import Mouse

import Component.Cell as Cell
import Component.ThreeDViewer as TDV

type alias CellId = Int

type alias Flags =
    { cellId: CellId
    , refX: Float
    , refY: Float
    }

type alias Model =
    { cellId: CellId
    , refPosition: Mouse.Position
    , position: Maybe Mouse.Position
    }

init : Flags -> ( Model, Cmd Cell.Action )
init { cellId, refX, refY } =
    { cellId = cellId
    , refPosition = Mouse.Position (floor refX) (floor refY)
    , position = Nothing
    } ! []

update : Cell.Action -> Model -> ( Model, Cmd Cell.Action )
update action model =
    case action of
        Cell.MouseMove position ->
            (model |> withAdaptedPosition position) ! []
        _ -> model ! []

withAdaptedPosition : Mouse.Position -> Model -> Model
withAdaptedPosition position model =
    { model | position = TDV.adaptPosition model.refPosition position }

subscribe = \_ -> Sub.batch [ Mouse.moves Cell.MouseMove ]

