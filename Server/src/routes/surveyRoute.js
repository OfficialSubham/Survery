const { PrismaClient } = require("@prisma/client");
const { Router } = require("express");
const surveyRoute = Router();

const prisma = new PrismaClient();

//Create Survey
surveyRoute.post("/addsurvey", async (req, res) => {
  try {
    const { topic, questions } = req.body;
    const result = await prisma.$transaction(async () => {
      const surveyData = await prisma.survey.create({
        data: {
          topic,
        },
      });
      //giving all questins in an array
      const questionsArray = questions.map(({ question }) => {
        return { question, surveyId: surveyData.id };
      });

      //uploading questions in db
      await prisma.questions.createMany({
        data: questionsArray,
        skipDuplicates: true,
      });
      const insertedQuestion = await prisma.questions.findMany({
        where: {
          surveyId: surveyData.id,
        },
      });
      const optionData = questions.flatMap(({ question, options }) => {
        const questionId = insertedQuestion.find(
          (q) => q.question === question
        )?.id;
        return options.map(({ option }) => {
          return {
            option,
            questionId,
          };
        });
      });
      await prisma.options.createMany({
        data: optionData,
        skipDuplicates: true,
      });
      return surveyData;
    });
    res.json({ msg: "Survey Created successfully", survey: result });
  } catch (error) {
    console.log(error);
    res.send("Internal error");
  }
});

//Get all survey
surveyRoute.get("/getallsurvey", async (req, res) => {
  try {
    //getting all the survey

    const allSurvey = await prisma.survey.findMany({
      include: {
        Questions: true,
      },
    });

    res.json({ survey: allSurvey });
  } catch (error) {
    res.json({ msg: "Internal Error", error });
  }
});

//Get Specific Survey
surveyRoute.get("/getsurvey/:query", async (req, res) => {
  try {
    //getting all the survey
    const { query } = req.params;
    const survey = await prisma.survey.findMany({
      where: {
        topic: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        Questions: true,
      },
    });

    res.json({ survey });
  } catch (error) {
    res.json({ msg: "Internal Error", error });
  }
});

//Delete Specific Survey
surveyRoute.delete("/deletesurvey/:id", async (req, res) => {
  try {
    //getting all the survey
    const survey = await prisma.survey.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.json({ msg: "Survey deleted Successfully", survey });
  } catch (error) {
    res.json({ msg: "Internal Error", error });
  }
});

//Get all the question related to a specific survey
surveyRoute.get("/getquestions/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const questions = await prisma.questions.findMany({
      where: {
        surveyId: Number(id),
      },
      include: {
        Options: true,
        survey: true,
      },
    });

    res.json({ questions });
  } catch (error) {
    res.status(500).json({ msg: "Internal Error occured" });
  }
});

//UPDATE

//update survey name
surveyRoute.put("/updatesurvey", async (req, res) => {
  try {
    const { topic, id } = req.body;
    await prisma.survey.update({
      where: {
        id: Number(id),
      },
      data: {
        topic,
      },
    });
    res.json({ msg: "Survey Updated Successfully" });
  } catch (error) {
    res.json({ msg: "Internal Error Occured", error });
  }
});

//update question name
surveyRoute.put("/updatequestion", async (req, res) => {
  try {
    const { question, id } = req.body;
    await prisma.questions.update({
      where: {
        id: Number(id),
      },
      data: {
        question,
      },
    });
    res.json({ msg: "Question Updated Successfully" });
  } catch (error) {
    res.json({ msg: "Internal Error Occured", error });
  }
});

//delete specific question
surveyRoute.delete("/deletequestion/:id", async(req, res) => {
  try {
    
    const {id} = req.params

    await prisma.questions.delete({
      where: {
        id: Number(id)
      }
    })

    res.json({msg: "Question Deleted Successfully"})

  } catch (error) {
    res.json({msg: "Internal error", error})
  }
})

//update option
surveyRoute.put("/updateoption", async (req, res) => {
  try {
    const {option, id} = req.body
    const data = await prisma.options.update({
      where: {
        id: Number(id)
      },
      data: {
        option
      },
      include: {
        question: true
      }
    })

    res.json({data})
  } catch (error) {
    res.json({msg: "Internal error occured", error})
  }
})

//Delete Option
surveyRoute.delete("/deleteoption/:id", async (req, res) => {
  try {
    const {id} = req.params
    await prisma.options.delete({
      where: {
        id: Number(id)
      }
    })

    res.json({msg: "Option Deleted Successfully"})
  } catch (error) {
    res.json({msg: "Internal error occured", error})
  }
})

//For my use DELETE ALL SURVEY
surveyRoute.delete("/deleteallsurvey", async (req, res) => {
  try {
    await prisma.survey.deleteMany();
    res.json({ msg: "All survey deleted Successsfully" });
  } catch (error) {
    res.json({ msg: "Some error occured" });
  }
});

module.exports = surveyRoute;
