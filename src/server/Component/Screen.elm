port module Component.Screen exposing
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
    }

type alias Model =
    { cellId: CellId
    , refPosition: Maybe Mouse.Position
    , position: Maybe Mouse.Position
    }

init : Flags -> ( Model, Cmd Cell.Action )
init { cellId } =
    { cellId = cellId
    , refPosition = Nothing
    , position = Nothing
    } ! []

update : Cell.Action -> Model -> ( Model, Cmd Cell.Action )
update action model =
    case action of
        Cell.MouseMove position ->
            (model |> withAdaptedPosition position) ! []
        Cell.SetRefPosition refPosition ->
            { model | refPosition = Just refPosition } ! []
        _ -> model ! []

withAdaptedPosition : Mouse.Position -> Model -> Model
withAdaptedPosition position model =
    { model | position = TDV.adaptPosition model.refPosition position }

subscribe = \_ -> [ Mouse.moves Cell.MouseMove ]

