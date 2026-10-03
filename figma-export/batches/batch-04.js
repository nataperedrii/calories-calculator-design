const IDS = ["03-about-you-error","06-target-floor","14-recipe-detail-edit","14-recipe-detail-edited","14-recipe-detail-deleted","14-recipe-detail-discard","14-recipe-detail-saving","14-recipe-detail-name-error","14-recipe-detail-method","14-recipe-detail-steps-edit","14-recipe-detail-step-error","14-recipe-detail-step-deleted","14-recipe-detail-no-steps"];
const SUMS = [364312857,1177501663,2119085594,3487565975,2134558348,2372039355,1053873894,2261731271,3352134408,3618816614,4228579348,2113302246,3989328591,2963555502];
const PACK = "7V15k9s2lv9/PwWKqa2dqZVo3CS1Saaca5JdeSc1zlFTsauLoiCJaTapJalu90zlu2+BBCieOtqSWrbhVGy1WgKBh3fh9w78Zn2e3S/BfSgevkreffHGggACTAGmbyyQ5WlyK754Y32GZxgh940FFmEUffHGipNYVB8YP4TzfPXFGwuv323fjMJYBP76izdWmmziefMXvydhXPtNNQB8Y4GVCJerXP/07i6Ksy/eWKs8X09evHh4eLAfiJ2kyxcYQvgiu1++sb78fPnl52s/X4H5F2+sVwwg735MXnl2+Yq/QrR44b1CbvHeL4780gv5lS8/f7H88nM5zpfW6CMkBgUI+ggDhIFcDQKIA/jKAYjYzHdsBuT/6jcQwFcIAuT4BBD1JpXvYYDhyoboI6daKoIcyBVgm72xwOMXbyy3NjRy6kN7byyQVh/+8vMX8tt1ymMMELonNZpV4+vRESweVD0A1x9A9QPQlmjBJk1FnH+dRElap25JzGoSV7s5tLE59GksjRhg0dgBxX/vw5KuQOICq0a8vurip4NXHYRpEAkQvNPsETzqV2nJhF9+/qL8UINEWMr1PbOZfIm4zd5XfBfFn6umVcMCYJtF1GaA2myKPEmN91m9A9mCeh+IfMjVrxD9EJT1afQBBuwe0VOsmwoKCb3qdT9dIyCkFYLz/vrgQ+MQDLOxM6Y2GztjBH0qHZvCwXHG2OYvtz8jDyAYQMDkRwGCxV//3EWqQyY0QM8daq+Prg3Ct0n9JELXqcSBZ7OIAw74mNcX/NHyhTQQzgox6fXSFX3F5c8RAoisvAiNESncYXTPihMEut9pQ0I5ZBrGPbvNOECEdx02TaTPYPGnSyfUT6fZJs97yXQX5iKtk4k1GYscblBr0sMBwi54iQodos8RmEL5ds/ewqbjEAgSBEMMccjeq0VVlC9mVlF7fO9HG7F3GgGlBPknmEadJlPEbXm0wvIFBwjxKXJsySrQRtPysAmpjacYAs+16RQj2wEetvkUE9sFrjPF3EbARTabYtd2gMNtNCXyUw603Smhtgc4k69cmwAObW9KsY0A4zaeUg4Ysp0pgzYG1LHplFHbAZTYZMo8mwDi2WzKqY0A4VPu2RgQbDtTh9oEYE++8mwHYG57U5fZGGDpLXnQdgHGNpl6Uh4wlB4UxDYByJsi6NoIIMd2pwjJgZH8MsKwfEmeqjYuZHjP6Iq7ysMccsZ/QTgiAL+PzfW9gDqLj9E7caXDTiIsudF2pqgwRR85qeqGl0cFRPMKuYBPOZAG9OlrJ5wxFHw4RzUvgGMX8LG0sVT+DYE75uo1ov9sq/7qe5Ezdoy3f5rzv/FejPcifY/Kf8Fb/4VMkWd70oNh0oPh0oNxpQfjANeR3g2XHowjPRguPRgiPRgGHCR9GemR8MKrkZ4DR9JvQbYrPRg2pcx2AMNTKsenjvRlpG9CiXzl2p70YLwpl08iclwun0DI1JHeE4HSf0EAyzm40pfH1Hal/4Kk" +
"/8KnnhwdQ2lQICqAf7kq6EhXxpFuCyKSAM4Uyd8U/ssUYVa4MlNEkH7hyF/Rp7o2F0LOrg5LcQLsI/jBhEkwXFGJFHrRmI7plALE+y2PjJwALuFFQD8ZTFEqT+8X9kqqiYiPC5DgkwMYpR3sw0c+9sWfdOcvpBZII5ZW/HR8HFDH6Ujd7W1QtdjGMgzYGwT0gLvirzypTYt/+Ir0Eu/tv/3LCufWxIJk7M+STT5+TDZjkaZJao2s2L8Txe/AS/k78JhswAvwfTEJIN9IFiD146WwRtY7awJH1mPxd+TPRGRNrG/lOBnw4zmIwrswz6yRladCWJN/Wbk1sb6Tz7AmVjX6BAQrEdyqdVoj68GaEA+OrJU1cSkdWXLzrIn12WK24EI+NojCtTVBI+vWmvxWjvpTORuCi+kgajM1ju0UA2E0svJ38pPQnUBsjSy5n1kxysKaWN/78a2IwV/TJBfZrTWyFg/WhEM4suRn+MiK5CB0ZEVZsdpATqiULbk+f2ZN0B+jci6v1QrDcRYuYz8qp4Y9t5wbU3PD5RLlP/fWBHa//RAuQr0svOu7PU+e+Xku0kf1dcp3fR3rr+ut8dfr8cxP6xtMnca+MN6zLdvd0AOFQRKPZ3kM3mwgnDngKz+4LUdF5bC8GFVu8qr8J7UmnufVx6qvqfVt+c9DuS1qd+6tCfnj7R9v2yvKglSI+OZmlswf68tCkDTWxSnpZS89ziIU0fzmJkjiPE30xpZDjWk5ElMUwjUKLRbBglvF6iQvlRrFmvxmfeYGjs+5NUI2e9vDz0jxTDk2ZtuVlsxM6GGcTA/jZE029XTsKrYrt0kuaWVNkKef/ij8NOtM4OU/RSpy8CqJE/V0tufp5dnY2m7bTw3KspL3XCK5d1UOU04AuSBPAIIQ9E+llxbVbHA5G0njvtn0zsVDJcdCm5dzcfVcvtfq6xjFQhVB0M7tOID7kNyV49nPdzFFgTXCBzCfRG1b7Ic4g+dkQCIPTXUWxNB2W0wY3J2DA7dax49Emjdp7ZS0Rrxix3trQltzp+rDrlJSiNikxb7fxrlIga8sH5iJ/EGIGCAMC/OJCQQ9q3sSU5fpJwNMjdUWU6KpW3H1r8/K1Zji8yvVHr7m5Lm5+nZ5fr1KlPHjXDlJW84kTCpWzCDomcjptSohbilRTHlrRE/ktXgHFkkK8pWQ/95tIv9IZnQVbZyDmDFZ52ESjwM/nTdn6KAGJ1K3xokFbtfLiSWWNsyJyi8jyr4qDbF1Vr8Td34kTuqt7ljxzc2dn95qJlX6C7d9LL1sb0YYYtZun61w7ZVCLB3JHtXJ+ly2oZ2g2BneiafrhMZOENbZiVdXtw+a7DsXeQxhXdIgrENOT1gJfnotyv6YioVIQZzkUudk/uNZyNycDi2lGZPKp6xZPLDJRKFw/HuR+kshT7yzJF9pBZTZR1qHAXvYUokHMgLWZ9v3YIW2f62FkmpLWOnf75MH4Ad5eC+Anwp5XP/Ls+hfDp2z" +
"M6fn2Kgt9UmWR48gC/M8jJfPKf/vte2D5+FFkuT187BDeeM87PUp1+6xuHbE/zqJ8zDeiKbHPOzGCW8+D2bbzevuEdXYh3ZW2ptUe+QB2+Ps2Z4SKrdGli/nFwjpo1t/lFT8o0LO+Dj306XIx4soacBmHHzjh9EjKH8NXoCXeem8yM9NABox6VQFGhWiTgWg9YFk9bEmIEoeRGYQMoOQXSFC1oJJSll1OijJ61ysAZMWlZ3mUDlgRNdpskxFlt3cZGLZ8uS1HinPXPs82rcHDO0VB7gzDY44svnZRscE2/RsoxOoj7pPHr3lq6hDO0FqHFIdmf+RbFIwrynMDoP9I9nES/BapOGi5aJh5aUQakMIlRIbQ1ty3S6jLa21Ft2+59dMYMuBQZ4jVU2fDyPFNFv58+TBmvz2m362PEbCERrhEXw7ar2LR+4Ivt3l4SgPj7hKIlml7QuLdATYQJUgUsf2PI9XpHLd3Tq/OSGu2KECxSoNIW0j8MH80HPAE73sOz9Ik5ubW/HYJJRSd0hh3bjOpnhRAEO72FSbV1geMBjvgH4/an75US4jjN8TXrHlOzsQFr0urMITyG6j+AjCE2BNu3edMVvPQ4H5+tzF9DSOAryIooInhzl8t2d+2qI+yFbyXJMsQOBHSRqKrEk2VhpQr1Q2dW+YimC+6EU/KtveipAWERy1bncvX70d2EhebqRHWvTD/N/lMpRreW5KbuUG7xUc33F8ONsjOJWbrySHUI2JVpLznd677/z83FKDm2LTg9AycnapQazAoa5JbL7z80GRweeRGQJt2h5pgKXeDm3jkNAQ9CxCg8leoSEzHgRwn1PEWuYGd8zN19XB3E9n2ZnFplrXDmvD3bPLDXauztwU1B+SnIpsJ5YcWb3THmmAr94O7eSQ5FByHskZilURogPvqOUwvpz/vsnOG6LMcrFei2ozv+lx8qE+58gaJgWnevqsQ/t38kCwsjWLm5saXjAVWdbipgYHNHCDJr62hQ3uwniT7ccNeGdzKK1/mrazU9BxJ4u9wl4gcqkKSPdKvlehWwq1qCLarH6+OKfs9+3SqyQVHWvJFGZwzE6to0M2yvljEOsnsvxPOVhuDzaTFdBMiVDa4KeVUKCjxjNlLFZmBIZZDco8bzxk5sexSJuhKuToVajjNOfDItZHyDBeJK0DUg8h3fYxBjeCWQ7rix7Nk/g/crBMCsrJyLUfg3wVHho1OlJF9c4MO65Sk1t45Cc/upUBNh/MkyBPUpCkYB6KPMxDPwZFHiiYhculSEGwkvmd9Qnj99hWPeEOXlQTEBlmeihEJNhEfi7mBcXKpZVSQj1P61VHO4S9wlK5fmpb9bcoV9+qpWwNPfWYMMLAqsvU424YoZ384gd5dggVNP7FvBbnEwLPCCPpeearhrTgMl8Dc61fSSEKsyTPk7vCmGmlTfpQqTpITLp5UVIRHbkLLU8V2ZQ2tcrIyuXQG6mbAz8TPXuh14gdT6lmtUxG1RSP" +
"WyVCyifwVHZVa5m/yHKss6+zYTZ7Fj1v4nKstbHM7V1ykdSyb2sxo0rmtmro7yKToVQgYpEuH0eF/QB/ehUuFlEYj1/n4L9Fkv55IhuESamYO4AT8J+A25jpNxCXLzGWpRL6PUL1W4ijM+stTbItnyiqVXxyANEuHJZ9nftpDvLUD27LQPZBwdk6Mj+gZanM59iGZ1HpCDfiiZ1nnyBKWxa67YnSIjpORRCuxXgucj+MxmIe5ttYLaLgmzBbgfKX4AX4dh7mIIyXqZiHIs6zZhzMpbUiB/lJH8zDbDVQ3tAz1nmjtsidEBO1fb6orfStSm7LLhHAHe2e0Wv/XqjpKFqpA/1R01kJX+c+75qPd9aSC+khNSstYMsFQpjCi4fSyoQcadsqEfyhIe4Hxx6xzpCSAbWjstiUY+F1PCgE1kkq84nOmbzLXRU5VvMgKrVvO42SGc8yh+3pcK5L0Vyo0HJabhFHyvvANakW/oIWUp0WstDZ5VKZlfxFmT4y1FaEHUTAz6+/efl+nlsNS8WI+aTP0aiZj5ublfCbrpqr7DZSHrjzNP/bxZ1Fbvn4wt5pG912lXNRzpR5GvurZvryLtlcfJY79qme6VyV5FDlEElb3TEuyrM63MFGjZO+bFfQOtUeu3snLNtQc1PZtZozz1O10a7Z+DqZF2W+Ih+BmX8r5qct4eiGlpQ1w1oHt/fhGN48/R4gAlXKx/lKZ7wu4AvPTHVGG2THrAPq/ByHz0B0Pa/TUl17YsFK3I+19odqg92eSgoEB7IGioDYNrRUxrOHImEHbVm8iaIDD8xt5/QbEYlcgD6JLQ4UOiubHuOr5qmfrfb7qggNirKq7fSozdvuFHNLoEItADFoQ3DiyqgDzQqh0JiVy5mVH5PczxORjcAsCSMxBzJn6PbQtC1jXU5oXTA01sVYl0Otyw7BvVIj49CGkZE5Bc9lZBhHxshczsh8lSZBkESh5tVTq7m9wQbNcyWuHUjkKDtxXZgfByLqCzwgB3VJ3Sqp7lCU63wbFXdguiFHrSxMP/EE4YZmCspgNLcNwKpAumICz9u37L3xFsJ1QihTCrdTqNx68LPGWgpOHoq2aAUtFZ0M3iEPS8caLCcgT3I/ysBmPfdz0SyUK+MwQxGXQs2bmIuJuZiYy/vEXOJNnoYNXQ2bOSf0vMVLmhrZ/VJLf5mPoasolO9ElF+K284WISo0oUByl6io9LbuiSLvLFVPdSU5lNe/jZqTbdgc9RVCyazTo0I5BybZtZR5v1uvep64bucY9E0oc/LAbDPvq7M7RfafngosMtmK2cChnHLX8c6fU162/KqRhbmd6tYfRVp0I1uekyQEYpV2soMkCKLzkWRPDR1G6BQ1dBh611VDhwkeKgai5y+ho7oWCCudcS0ldE0aMfe0xT+eYu0nF8xhB7eK0St6JYsBab1AvdwOITmqXk5LyXXUy+0QEYQvWC93NTJSkr5OoRMLCNLN255eHaclhGlZa0iIc2EB" +
"0ZVHOwTkqNq4yoxcSW3cDhEhF3Bj+NWJiCZ+nUanFhLaFZIjC+F2mxHM2HmkpGnLpOunTt2szcxf+aksMEweiqIBfWgA/tIP46xotK27UyyTg0t2juD2/tKGZvERJyZzz2Tumcw9k7lnMvdM9Mtk7pnMPZNbYTL3jkmqMJFsE8m+dCR7XjD9rlD2X/00CgOgPjgCP8dz1V3Ao/vC1lujD7YPMmFrE7Y2Yet22Jox79hSQV41gKggByi9+7M3TLhMXt2nmtBmPPr9Hr3JljYe/cEefY/AXkGWtOt0gEnCmpU4z5gk7Wgcz8BEB0mWvgwJP8Wi/C2Sd5AkYWRMyTOYEmNJjCU50JLUBfUaTEiVG1eZELdVzHkWC7ILUXk5r6ept243a59XDgOT+ltE6haTWqu2ukS2k2Yd/XGdlMo7mExn6ueHpFoXQEDd/YVX1+VVt1W9EvkqmZ/lgqoaa4Z3zduNGOF9Qkv6LwRlRCMzDu9cfvCTLHwABIK7MD5rWi12Ffy2nQ6rosDbjqAivZcFGqedSrehWuJnTTHgTvM2ZV7LEqjYRWvcgSO7O8J0KLE8HK/CZbOlodK8Lf1C+/tsVk1+XbfTArQJBp6GdMqb7CXczU0Jc2vtsgUfMXaVRKs+ho7ShbpxJjygcSbRqfN1Y1w84QTGeEF9yGd70Wi1ziBKMlGZmzC7C7OsiSy6fb104cDVlHK0A0wMMyEHE3K4dMghzNQViEMhhwJHfgjzVYtOFO0LOHxTjq2/9xcTbjDhBhNuMJ0JTX6jyW80+Y0mv9EA1ya/0eQ3Ggzb5DeazoSmM6HpTGisi7Euxrp80p0JCboaI2M6E5rOhCa4YoIre4Iravl/r7C44HaeJuu+BjM9cY+SqJx3L/dcCZGP56EfJcv6WMxtjobltbk7oONinOHJFF/vE+7fCB4RPIISHh6Ej8du8Zn+vPTiyTc3Kz+eRzr66bB68LScQm0CwpvPg339aJTkYMVCHtIXA6Jtz7BO3OkkQDQs/lgD6SIqikI9BQFvb6L7R7JRc5kDBMJc3Nngh0Vxu2kkJKvGycMI5CuRVVwL5PXNUZLlJ7oacwg53grr/wixBrKVZufWNuUHHZcmpOUh2eRy+uWI49KyjnXKhVulXKTl42rmRKsb3PEiCNSN2lRmhL79eKsAWot5Fu3X4sImTZ2dNA2Ev+sqPMRsp5E+hdyO5u8+/QREcAUSfUTYF2TO/PtyI4ZizK+LD7zZYIi5dhfcfeHl8ku1FZrgsgkum+CyacFqWrCaFqymBatpwWpasJoWrKYFq2nBalqwmhaspgWracFqWrCaFqwmRdmkKJsUZZOibFKUTYqySSIzSWQmicy0YDUpO/WwVjsQuz9lp5620btsxlvLdjvR1daDT7B4B7IF9Y6th5YR6rFI0yTdEa7+X/9OTMC9H4Vzvzh46S8UZ0h2QF30Csixq++ZyLWJXJvI9aGR6x/UOEpyC6M0DpK5/ft6uSPVrRQsOUCQ" +
"3HcDoTqvTKX9ctaJ+FVyexbHRcsz8jRox4k2Ek4LhYLgBeDwlBjUUNivz43SlHK94SSmYS/KdzFFwbY530B+XzFqcYRwO7jJt1KXA7/YixFYJCkQ7/y7dSRbtmCIgq8kR4AgmZd9K2Yqtbj45dw+DdChcqH2pb8qdqmty/GqLACvErWDs1+1p6ixQe52eynVnnuMHR3qnDOQ+jo6yGmS/Z+8xsK53k/dNYcf0BuI0k4Hqyc5SgNrdALsF70H96xxi2LpLmpE7SYmOgmxjmJxsZh7PSjWVo8uUqH94Tqm1Tov8LaM1D/rOt1oYJhnCgUukjdOBoIRzhgKekmjnlOjjYuarbV4P7Q/1F/Oj0RlYnjdB20dFZz+zlkKeunpm/V1EucSKJ+ARZit7HNq8+ZcMCWKjbfJwd+lQoBFmtyBtfDjTZ6NwF0Y3Y7AMtrkIgZ+PAdiuTxRHvDg4a+bBcaU+bnWPDD30NNhYbbPcjqcJktQYfj6TcpxUcPUd2jsM5XDKr+v1aJDdDZZX6dF5HVSqpj+vE4+Y63TQd8izlk00dJkiDWzuTFXBm07Q8rxBSdEeXNCCiPaTkdt7rO17LrTvSeHjqdlc8oJ4CDLxbrB8xhxqdT9mZBPLHCTfCVANWTfcbXqdWlOqeaUak6ph55Sm8cZ9dzLtpLtMVmFyFfiXmSY6iSRqqeYo9OMej30LXVlgU3LXe/jYtjfnrby7THtBGW+nYf5RTz7Xc126TG9dvFVtdrFl+6022I4ZbBq5kcRtfTGa56QM4QanPSOnNp86rFf2oj8ol527xni5ibe3PUyvjoCuv0hgZaaqlw05W9U3Zr1ca7aM3TSI0plFt/uPqzwKuUAOXom3wu/9BiSexFLi4EhLFUL/Br8CbnbHxZ+/GcbvA7Szaz4wlr1IigONLLEW757JzsS5CsRpkVfgqxoUOBHuZiDB19iPBLbQawAbgguJGiTy34GmzgPI+CD2zhcCJBF4VwUXxZ+FkaPNvgm9cO4dmZip4xy7uEqRN0mX2G4o0ByJhZJKhrcBBtxedSuFkb+Lnm7OHPiZ2FOR8OzXmVIf9zkTU6TGXFATm0uA5eyVjBP/ceCAdepyDIg/GAFkliUMKH8bpngAZIF8MEy8rNMcZr8neRQEKR+cJuBZC1iG3yVbrJVycfFCCs/WpTSoa8mqLEgvSALYu4eoNo+GhYkz8OCVRnXVj/+qNSjxJ7n6eMIZMLPkhiEeckhPliHsWS6RaHnSl4UMoOpeBn5j/KjsXiXS+Va52YbSFS7VIi4VIiItRWi/ILEtEAoWdT/v40ohl1E/q3IlHIcgSQFnFSKutTAMpE0uBVZDtZ+mj+T5qSoec+RTDH4eLmWPo9V52oivIIgf12FkdjyjoynqZZBpU5U4ROwiJJU5FnBg6RkQao5UDHg75ssB7mI5yItOhrEYC4tMXgQUV0XkgsyFYOflC5kz8NVrp7IVhf+6qd3BQOlUq0kLcso9Y4Psjs/isDa" +
"j6VDmYIoeQAr4ed2cXNNYXSjMBBzsCyvupDKLEiS21INKrewxYJrPxJgmURzEf8XyKXODOXTy8fLwUG5x/LtWZo8xNnJtZ0Bpg0w/QkC08VxX6NCQ+B0AUAVn5yAu+RejNT9NTrmU8ep+9DoJoBlIGkDSRtI+mmQNL62682IewTiSvg1Ia7VbK4OcXU615Jzj14L5IolejNUbGMw2K1NqnFTLtYAXbx0gjVqhrDjbs9SJ6hXUXpUK0LeKlj5UFHnc9TWaAbxlJsN9VV7ZHuDcSzUsaJoKSTFxQY/xEG0mQsgtW5JjlzcrUXq55tUZAemFz2x+rNtSV8l96KYFkBgs9Z1BqqEnzjHmFM/TZOHcTXIDouK0X4TX5/YPHnQjZIpffrUtsPsnBw+uB4n0wqgVoRz5MyOK8I5EHL2nA9VteNrUu3401LtVx60MRp8n6LEF9Tg5BgNjq9bg+MLanBTRmk6n18eCtxbRvnt3Tp/LKRhUq+g9Og+DLAwlKZ20kCABgJ8atffQbxoTFzUQYzgMyJG73mwMB6v8XiNx/upebwHpoZ47XsEnWHVsqOE+RPPhBuCMsiVQBkeP0lhul60Og1hVLVQrepuf03DXICHlV+k782TEmgOs0IAisS7MtgNwvy8ZejDSoJ0tJfucf7M2ov0aK8nTe082ou02h4dN7NzaC8XtRwjyj4UxJVek5qiH5aaOsz9JHzA/bx8suc5PUqtiz9sj5J2dbLqrfLMOpn26eSnTO08Opm2dPJxMzMYqsFQrx5DLf3FXdX+hQ1THxuBn+N5oi+NQAfhqNsnGCTVIKkGSW0jqYx5T0RSKenk3hHHMUiqQVINkmqQ1I8bSf1wsAgDmT4diwgoJdIaYYNEfBxIBLlWJIJcNxJBLohEHIgOqyu/PsB8XIMOP59P/SEWbaOTFW13hCtP/CxvnOq4Q5tdbWG7IUBtWwYOdO4I06H2p+F4FS5Xzba3bp8yoP3sjHUXNw92Gt++Vpq0QnxOUI+mVEkv4W5ulNlTGnMLTmHsqnuNy7UxbTV1cwZ4QFNooi/6rl8rUzzhBAK7oD7ks72ApVpnECWZqNX134VZ1oSf3B6D0FzllgOK0Q6wB8yg0gaVvjAqHScV1DV4PUqiC/yFyvD1dX0/ct19oLT+Nngsbps3oLQBpQ0ofWx6b/c+1jFh7d6bjF0CjG5fu6hhAdK8flA2/jjgesXG1cLjPIxEnUwKCGPY3t47WC3QFd4C7rtSVN1J2rkj9ceTXaHgBJgx2GkloK/JKC666L2qGZ/kvpeBW2eYcseGH3/aK4/f9t4VXdvQyhPYvacLOPcP3dPOLRkn21Pu0Bl0e/Z0H1HheffUua49RRiqu4j1ptLOlgp/ARcHbqlr8/Yt76e77ndGhTvrXhJl8z00dc65pcUVHM+xpbXLft06PMGqJNhqBoSB3k5U70GGxs2+XUBnj6mh8EmmpucW5uo4sj1x/k1jI6c5TvfvO3apPhchffR1W2RH" +
"8ES30u+k+eiTN8PwkzbDvDqQf7hmGFV8VROeM+4q1cJ7RYZ4eyvbR2uI4aduiF332gyxcypDTJxO07e/FtGGs1phDyumU1Z4e695RXNmjLAxwuYsbM7C5ix8bsjq2U0wd1TURpvg7kXNzsUs8MA1ypiQq794DGNsbh6r75njHNEIV16Fc0WdcLfTea5WuEXQ8eZGBnfU5Jg661CiKVWaTwcflLm03ap56Oswmt4rlfeqcv5wyXi0I44Ie/oQiDWBEEFKZZEqINmKfjap9I9kEy/Ba5GGixaJMNZyaXued1CUu8VMjk7L4jpMhD2m3ARa6TOZ4bNKHmTYrkjpKYrb52G2GhVp9a0sxxHIEnkNNQj8GNyprB5/2WySit8je6e6vL5vZT1KSE6/VqiBUMkYjFRbwpBi2qffhIDpEfcgMF6P+zuoc8dAfcpnDfqbCyvMhRUf54UV/w8=";
const PAGE = "States";
const SLOT = [0, 0];
const TOKENS = null;
// <inflate> raw DEFLATE (RFC 1951) decoder, written for this export
const inflate = (src) => {
let pos = 0, buf = 0, cnt = 0; const out = [];
const bits = (n) => { let v = 0; for (let i = 0; i < n; i++) { if (!cnt) { buf = src[pos++]; cnt = 8; } v |= (buf & 1) << i; buf >>= 1; cnt--; } return v; };
const table = (lens) => { const count = new Array(16).fill(0), offs = new Array(16).fill(0), sym = [];
for (const l of lens) count[l]++; count[0] = 0; for (let i = 1; i < 16; i++) offs[i] = offs[i - 1] + count[i - 1];
lens.forEach((l, i) => { if (l) sym[offs[l]++] = i; }); return { count, sym }; };
const decode = (h) => { let code = 0, first = 0, index = 0;
for (let len = 1; len < 16; len++) { code |= bits(1); const c = h.count[len]; if (code - c < first) return h.sym[index + code - first]; index += c; first = (first + c) << 1; code <<= 1; }
throw new Error("bad deflate code"); };
const LB = [3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258], LE = [0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0];
const DB = [1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577], DE = [0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
let last;
do {
last = bits(1); const type = bits(2);
if (type === 0) { cnt = 0; const len = src[pos] | (src[pos + 1] << 8); pos += 4; for (let i = 0; i < len; i++) out.push(src[pos++]); continue; }
let lt, dt;
if (type === 1) { const l = []; for (let i = 0; i < 288; i++) l.push(i < 144 ? 8 : i < 256 ? 9 : i < 280 ? 7 : 8); lt = table(l); dt = table(new Array(30).fill(5)); }
else {
const hl = bits(5) + 257, hd = bits(5) + 1, hc = bits(4) + 4, ord = [16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15], cl = new Array(19).fill(0);
for (let i = 0; i < hc; i++) cl[ord[i]] = bits(3);
const ct = table(cl), L = [];
while (L.length < hl + hd) { const s = decode(ct); if (s < 16) { L.push(s); continue; } let r, v = 0;
if (s === 16) { v = L[L.length - 1]; r = 3 + bits(2); } else if (s === 17) r = 3 + bits(3); else r = 11 + bits(7); while (r--) L.push(v); }
lt = table(L.slice(0, hl)); dt = table(L.slice(hl));
}
for (;;) { const s = decode(lt); if (s < 256) out.push(s); else if (s === 256) break;
else { const i = s - 257, len = LB[i] + bits(LE[i]), d = decode(dt), dist = DB[d] + bits(DE[d]); for (let k = 0; k < len; k++) out.push(out[out.length - dist]); } }
} while (!last);
let str = ""; for (let i = 0; i < out.length; i += 8192) str += String.fromCharCode.apply(null, out.slice(i, i + 8192)); return str;
};
// </inflate>
const unpack = (s) => inflate(figma.base64Decode(s));
const sum = (t) => { let h = 5381; for (let i = 0; i < t.length; i++) h = (Math.imul(h, 33) + t.charCodeAt(i)) >>> 0; return h; };
const report = { frames: [], images: [], fonts: {}, fallbacks: [], errors: [], failed: [] };
let parts = [];
try { parts = unpack(PACK).split("\n"); } catch (e) { report.errors.push("unpack: " + e.message); }
const piece = (i) => { if (sum(parts[i] || "") !== SUMS[i]) throw new Error("checksum mismatch"); return JSON.parse(parts[i]); };
const data = { svgs: [] };
try { data.svgs = piece(0); } catch (e) { report.errors.push("svgs: " + e.message); report.failed = IDS.slice(); }
const STYLE = { 400: ["Regular"], 500: ["Medium"], 600: ["SemiBold", "Semi Bold"], 700: ["Bold"] };
const fontCache = {};
async function fontFor(family, weight) {
const key = family + weight;
if (key in fontCache) return fontCache[key];
for (const style of STYLE[weight] || ["Regular"]) {
try { await figma.loadFontAsync({ family, style }); fontCache[key] = { family, style }; report.fonts[key] = style; return fontCache[key]; } catch (e) {}
}
const fb = { family: "Inter", style: weight >= 600 ? "Semi Bold" : weight >= 500 ? "Medium" : "Regular" };
await figma.loadFontAsync(fb); fontCache[key] = fb; report.fallbacks.push(key); return fb;
}
const paint = (hex) => {
const h = hex.replace("#", "");
const c = { r: parseInt(h.slice(0, 2), 16) / 255, g: parseInt(h.slice(2, 4), 16) / 255, b: parseInt(h.slice(4, 6), 16) / 255 };
return { type: "SOLID", color: c, opacity: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1 };
};
const rgbaOf = (hex) => { const p = paint(hex); return { ...p.color, a: p.opacity }; };
function boxProps(node, n) {
node.fills = n.fill ? [paint(n.fill)] : [];
if (n.r !== undefined) {
if (Array.isArray(n.r)) { [node.topLeftRadius, node.topRightRadius, node.bottomRightRadius, node.bottomLeftRadius] = n.r; }
else node.cornerRadius = Math.min(n.r, Math.min(n.w, n.h) / 2);
}
if (n.stroke) { node.strokes = [paint(n.stroke[0])]; node.strokeWeight = n.stroke[1]; node.strokeAlign = "INSIDE"; if (n.dash) node.dashPattern = [4, 4]; }
else if ((n.bottom || n.top) && "strokeTopWeight" in node) {
const s = n.bottom || n.top; node.strokes = [paint(s[0])]; node.strokeAlign = "INSIDE";
node.strokeTopWeight = n.top ? n.top[1] : 0; node.strokeBottomWeight = n.bottom ? n.bottom[1] : 0; node.strokeLeftWeight = 0; node.strokeRightWeight = 0;
}
if (n.shadow) node.effects = n.shadow.map(([c, x, y, b, sp]) => ({ type: "DROP_SHADOW", color: rgbaOf(c), offset: { x, y }, radius: b, spread: sp, visible: true, blendMode: "NORMAL" }));
if (n.o !== undefined) node.opacity = n.o;
}
async function build(n, parent) {
try {
if (n.t === "F" || n.t === "R") {
const node = n.t === "F" ? figma.createFrame() : figma.createRectangle();
node.name = n.n || "frame";
parent.appendChild(node);
node.x = n.x || 0; node.y = n.y || 0; node.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01));
boxProps(node, n);
if (n.t === "F") { node.clipsContent = !!n.clip; for (const k of n.k || []) await build(k, node); }
return node;
}
if (n.t === "I") {
const node = figma.createRectangle();
node.name = "image · " + n.n; parent.appendChild(node);
node.x = n.x; node.y = n.y; node.resize(n.w, n.h);
node.fills = [paint("#E9DDCB")]; if (n.r) node.cornerRadius = n.r;
report.images.push([node.id, n.n]);
return node;
}
if (n.t === "S") {
const svg = typeof n.v === "number" ? data.svgs[n.v] : n.svg;
const node = figma.createNodeFromSvg(svg);
node.name = "icon · " + n.n; parent.appendChild(node);
node.x = n.x; node.y = n.y;
if (Math.abs(node.width - n.w) > 0.5 || Math.abs(node.height - n.h) > 0.5) node.resize(n.w, n.h);
return node;
}
if (n.t === "T") {
const node = figma.createText();
node.fontName = await fontFor(n.f, n.fw);
node.characters = n.txt;
node.name = n.txt.slice(0, 40);
node.fontSize = n.s;
if (n.lh) node.lineHeight = { value: n.lh, unit: "PIXELS" };
if (n.ls) node.letterSpacing = { value: n.ls, unit: "PIXELS" };
node.fills = [paint(n.c)];
if (n.tt === "uppercase") node.textCase = "UPPER";
if (n.u) node.textDecoration = "UNDERLINE";
if (n.al) node.textAlignHorizontal = n.al === "center" ? "CENTER" : "RIGHT";
parent.appendChild(node);
if (n.lines > 1) { node.textAutoResize = "HEIGHT"; node.resize(n.w + 1, n.h); node.x = n.x; }
else {
node.textAutoResize = "WIDTH_AND_HEIGHT";
node.x = n.al === "right" ? n.x + n.w - node.width : n.al === "center" ? n.x + (n.w - node.width) / 2 : n.x;
}
node.y = n.y;
return node;
}
} catch (e) { report.errors.push((n.n || n.txt || n.t) + ": " + e.message); }
}
let page = figma.root.children.find((p) => p.name === PAGE);
if (!page) page = figma.root.children.find((p) => /^Page \d+$/.test(p.name) && p.children.length === 0);
if (!page) page = figma.createPage();
page.name = PAGE;
await figma.setCurrentPageAsync(page);
for (let i = 1; i <= (report.failed.length === IDS.length ? 0 : IDS.length); i++) {
let s;
try { s = piece(i); if (s.id !== IDS[i - 1]) throw new Error("id mismatch"); }
catch (e) { report.errors.push(IDS[i - 1] + ": " + e.message); report.failed.push(IDS[i - 1]); continue; }
if (s.label) {
const t = figma.createText(); t.fontName = await fontFor("Hanken Grotesk", 700); t.characters = s.label; t.fontSize = 28;
t.fills = [paint("#2B2118")]; page.appendChild(t); t.x = SLOT[0] + s.x; t.y = SLOT[1] + s.y - 64; t.name = "label · " + s.label;
}
const frame = await build(s.tree, page);
if (!frame) { report.failed.push(s.id); continue; }
frame.name = s.name; frame.x = SLOT[0] + s.x; frame.y = SLOT[1] + s.y;
report.frames.push([s.id, frame.id]);
}
return JSON.stringify(report);
