"""
Use this file for manually testing things
"""

from dotenv import load_dotenv

load_dotenv()

# from services.summarize import summarize_volume
# VOLUME = "iYGF27WhOWUxpwiY1OE6"
# print(summarize_volume(VOLUME))

import services.open_ai as open_ai

print(
    open_ai.get_embedding(
        "When you first assemble a group, it’s not a team right off the bat. It is a collection of individuals, just like any other group. And there is some truth to the adage “You’re only as good as your talent.” As a matter of fact, I think everyone understands that you can’t win championships without talent. So assembling skillful individuals as part of your team is a given. Then, of course, it becomes a matter of motivating those people to perform as a team."
    )
)
