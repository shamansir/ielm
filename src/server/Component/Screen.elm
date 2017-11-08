module Component.Screen exposing
    ( CellId
    , Model
    , init
    , update
    , subscribe
    )

import Mouse

import Component.Cell as Cell

type alias CellId = Int

type alias Model =
    { cellId: CellId
    , position: Mouse.Position
    }

init : CellId -> ( Model, Cmd Cell.Action )
init cellId =
    { cellId = cellId
    , position = Mouse.Position 250 250
    } ! []

update : Cell.Action -> Model -> ( Model, Cmd Cell.Action )
update action model =
    case action of
        Cell.MouseMove position ->
            { model | position = position } ! []
        _ -> model ! []

subscribe = \_ -> Sub.batch [ Mouse.moves Cell.MouseMove ]

