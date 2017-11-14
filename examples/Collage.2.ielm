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


triangle : Color -> Float -> Float -> Int -> Form
triangle color size angle gon =
     ngon gon size
     |> filled color
     |> rotate (degrees angle)


shape : Color -> Float -> Float -> Int -> Float -> Float -> Int -> List Form
shape color size1 rot1 gon1 size2 rot2 gon2 = map3 (triangle color) [size1,size2] [rot1,rot2] [gon1,gon2]


collage 300 300 (shape blue 100 30 3 100 90 3) |> toHtml


controlShape1 : Float -> Float -> Html a
controlShape1 rot1 rot2 =
    collage 300 300 (shape blue 100 rot1 3 100 rot2 3) |> toHtml


controlShape2 : Int -> Int -> Float -> Float -> Html a
controlShape2 gon1 gon2 rot1 rot2  =
    collage 300 300 (shape blue 100 rot1 gon1 100 rot2 gon2) |> toHtml


controlShape1


controlShape2
