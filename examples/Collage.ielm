import Html exposing (Html)
import List exposing (..)
import Color exposing (..)
import Element exposing (..)
import Collage exposing (..)

makeSquareOutlined : Color.Color -> Float -> Collage.Form
makeSquareOutlined color size =
    square size
    |> outlined (solid color)


toHtml (collage 300 300
    [makeSquareOutlined blue 50])


test : Float -> Html a
test n =
    toHtml (collage 300 300
        [makeSquareOutlined blue n])


test


triangle : Color -> Float -> Float -> Form
triangle color size angle =
     ngon 3 size
     |> filled color
     |> rotate (degrees angle)


star : Color -> List Form
star color = map2 (triangle color) [100,100] [30, 90]


collage 300 300 (star blue) |> toHtml
