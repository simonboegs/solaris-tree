var canvas = document.getElementById("treeCanvas");
var ctx = canvas.getContext("2d");

var width = canvas.width;
var height = canvas.height;

async function render() {
    console.log("render()", tree);
    var showRectangles = false;
    var labelsColor = "#135072";
    var branchesColor = "gray";
    ctx.fillStyle = "white";
    await ctx.fillRect(0, 0, canvas.width, canvas.height);
    //ctx.beginPath();
    var textSizeNormal = 15;
    var textSizeLarge = 17;
    var textSizeLargest = 20;
    var margin = 5;
    var thickness = 1;
    for (var i = 0; i < tree.branches.length; i++) {
        var branch = tree.branches[i];
        if (branch.large) {
            var textSize = textSizeLarge;
            if (branch.bold) textSize = textSizeLargest;
        } else {
            var textSize = textSizeNormal;
        }
        ctx.font = textSize + "px Oxygen";
        ctx.beginPath();
        ctx.lineWidth = thickness;
        ctx.moveTo(branch.rootPos[0], branch.rootPos[1]);
        ctx.lineTo(branch.endPos[0], branch.endPos[1]);
        //ctx.strokeStyle = branch.color;
        ctx.strokeStyle = branchesColor;
        ctx.stroke();
        ctx.closePath();
        if (branch.label != "") {
            var textWidth = ctx.measureText(branch.label).width;
            var labelData = getLabelData(branch, margin, textWidth, textSize);
            var rectangle = await createRectangle(branch, labelData, 5);
            rectangles.push(rectangle);
            if (showRectangles) {
                ctx.strokeStyle = "red";
                ctx.strokeRect(
                    rectangle.topLeft[0],
                    rectangle.topLeft[1],
                    rectangle.width,
                    rectangle.height
                );
            }
            ctx.fillStyle = labelsColor;
            ctx.textAlign = labelData.alignment;
            ctx.fillText(branch.label, labelData.pos[0], labelData.pos[1]);
        }
    }
}

function createTree(branches) {
    return {
        branches: branches,
    };
}

function createBranch(branch, fromRoot, angle, length, color, label) {
    var obj = {}; //fromRoot is distance from parent branch's root this branch's rootPos should be
    angle *= Math.PI / 180; //angle in degrees: negative angle goes left, positive goes right
    obj.rootPos = convert(
        fromRoot,
        getAngle(branch.rootPos, branch.endPos),
        branch.rootPos
    );
    obj.endPos = convert(
        length,
        angle + getAngle(branch.rootPos, branch.endPos),
        obj.rootPos
    );
    obj.angle = angle;
    obj.color = color;
    obj.length = length;
    obj.fromRoot = fromRoot;
    obj.label = label;
    obj.large = false;
    obj.bold = false;
    return obj;
}

function createBranches() {
    var root = {
        length: 25,
        rootPos: [width / 2 - 25, height],
        endPos: [width / 2 - 25, height - 25],
        color: "#000000",
        label: "",
    };
    //LEFT
    var e_coli = createBranch(root, root.length, -30, 160, "#000000", "E Coli");
    var cyan = createBranch(
        e_coli,
        e_coli.length / 2 + 5,
        -55,
        80,
        "#000000",
        "Cyanobacteria"
    );
    var bacillus = createBranch(
        e_coli,
        cyan.fromRoot + 15,
        60,
        55,
        "#000000",
        "Bacillus"
    );

    //RIGHT
    var fungi = createBranch(root, root.length, 60, 260, "#000000", "Fungi");
    var algae = createBranch(
        fungi,
        fungi.length / 2 + 20,
        65,
        50,
        "#000000",
        "Algae"
    );
    var unknown = createBranch(
        fungi,
        algae.fromRoot + 40,
        -90,
        75,
        "#000000",
        "Unknown"
    );
    var insect = createBranch(
        unknown,
        unknown.length / 2,
        75,
        40,
        "#000000",
        "Insect"
    );
    var yeast = createBranch(
        fungi,
        fungi.length - 30,
        60,
        30,
        "#000000",
        "Yeast"
    );

    return [root, e_coli, cyan, bacillus, fungi, algae, unknown, insect, yeast];
}

function getLabelData(branch, margin, textWidth, textSize) {
    var alignment = "";
    var pos = [...branch.endPos];
    //var angle = getAngle(branch.rootPos, branch.endPos) - (Math.PI * 3) / 2;
    var angle = getAngle(branch.rootPos, branch.endPos);
    var vert = "bottom";
    if (angle >= 0 && angle < Math.PI / 2) {
        alignment = "left";
        pos[1] += textSize;
        vert = "top";
    } else if (angle >= Math.PI / 2 && angle < Math.PI) {
        alignment = "right";
        pos[1] += textSize;
        vert = "top";
    } else if (angle >= Math.PI && angle < (Math.PI * 3) / 2) {
        alignment = "right";
    } else if (angle >= (Math.PI * 3) / 2 && angle < Math.PI * 2) {
        alignment = "left";
    }
    if (alignment == "left") pos[0] += margin;
    else if (alignment == "right") pos[0] -= margin;
    return {
        alignment: alignment,
        pos: pos,
        branchVertPos: vert,
        textWidth: textWidth,
        margin: margin,
        textSize: textSize,
    };
}

async function createRectangle(branch, labelData, padding) {
    if (labelData.alignment == "right" && labelData.branchVertPos == "bottom") {
        var topLeft = [
            branch.endPos[0] - labelData.textWidth - labelData.margin,
            branch.endPos[1] - labelData.textSize,
        ];
    } else if (
        labelData.alignment == "right" &&
        labelData.branchVertPos == "top"
    ) {
        var topLeft = [
            branch.endPos[0] - labelData.textWidth - labelData.margin,
            branch.endPos[1],
        ];
    } else if (
        labelData.alignment == "left" &&
        labelData.branchVertPos == "bottom"
    ) {
        var topLeft = [
            branch.endPos[0] + labelData.margin,
            branch.endPos[1] - labelData.textSize,
        ];
    } else if (
        labelData.alignment == "left" &&
        labelData.branchVertPos == "top"
    ) {
        var topLeft = [branch.endPos[0] + labelData.margin, branch.endPos[1]];
    }
    return {
        topLeft: [topLeft[0] - padding, topLeft[1] - padding],
        width: labelData.textWidth + 2 * padding,
        height: labelData.textSize + 2 * padding,
        label: branch.label,
    };
}

function getRectangle(pos, rectangles) {
    for (var i = 0; i < rectangles.length; i++) {
        var topLeft = rectangles[i].topLeft;
        var width = rectangles[i].width;
        var height = rectangles[i].height;
        if (
            pos[0] >= topLeft[0] &&
            pos[0] <= topLeft[0] + width &&
            pos[1] >= topLeft[1] &&
            pos[1] <= topLeft[1] + height
        ) {
            return rectangles[i];
        }
    }
    return null;
}

async function handleSelection(label, clicked) {
    console.log("handleSelection()", label);
    //await clearSelection(tree);
    switch (label) {
        case "Cyanobacteria":
            if (!clicked) {
                document.getElementById(
                    "biopharmaceuticals"
                ).style.borderWidth = "2px";
                document.getElementById("biopharmaceuticals").style.padding =
                    "2px";
            } else {
                document.getElementById(
                    "biopharmaceuticals"
                ).style.borderWidth = "3px";
                document.getElementById("biopharmaceuticals").style.padding =
                    "1px";
            }
            document.getElementById("antibody-production").style.color = "blue";
    }
    await tree.branches.forEach((branch) => {
        if (branch.label == label) {
            branch.large = true;
            if (clicked) branch.bold = true;
            return;
        }
    });
    rectangles = [];
    await render();
}

async function clearSelection() {
    console.log("clearSelection()");
    document
        .querySelectorAll(".item")
        .forEach((item) => (item.style.color = ""));
    document.querySelectorAll(".category").forEach((category) => {
        category.style.borderWidth = "";
        category.style.padding = "";
    });
    await tree.branches.forEach((branch) => {
        branch.large = false;
        branch.bold = false;
    });
    rectangles = [];
    await render();
}

function convert(r, theta, orgin) {
    var x = r * Math.cos(theta);
    var y = r * Math.sin(theta);
    return [x + orgin[0], y + orgin[1]];
}

function getAngle(pos1, pos2) {
    var x1 = pos1[0];
    var x2 = pos2[0];
    var y1 = pos1[1];
    var y2 = pos2[1];
    var a = Math.abs(Math.atan((y2 - y1) / (x2 - x1)));
    if (x2 >= x1 && y2 >= y1) return a;
    else if (x2 < x1 && y2 >= y1) return Math.PI - a;
    else if (x2 <= x1 && y2 < y1) return Math.PI + a;
    else if (x2 > x1 && y2 < y1) return 2 * Math.PI - a;
}

var branches = createBranches();

var tree = createTree(branches);
//render(bigTree);

var rectangles = [];
var hovered = "";
var selection = "";

canvas.addEventListener("mousemove", async (e) => {
    var x = e.offsetX;
    var y = e.offsetY;
    var rect = await getRectangle([x, y], rectangles);
    if (hovered == "" && rect !== null && selection == "") {
        await handleSelection(rect.label, false);
        hovered = rect.label;
    } else if (hovered !== "" && rect == null && selection == "") {
        await clearSelection();
        hovered = "";
    }
});
canvas.addEventListener("click", async (e) => {
    var x = e.offsetX;
    var y = e.offsetY;
    var rect = await getRectangle([x, y], rectangles);
    if (rect == null) {
        if (selection !== "") {
            await clearSelection();
            selection = "";
        }
    } else {
        await clearSelection();
        await handleSelection(rect.label, true);
        selection = rect.label;
    }
});

// async function renderTest() {
//     for (var i = 0; i < 3; i++) {
//         rectangles = [];
//         await render();
//     }
// }

async function launch() {
    await render();
}

launch();
