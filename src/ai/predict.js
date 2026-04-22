import tree from "./model.js";

// HELPER: VALIDASI INPUT
function hitungSkor(user) {
  return (
    (user.konsentrasi / 5) * 0.2 +
    (user.konsistensi / 5) * 0.2 +
    (user.durasi / 5) * 0.15 +
    (user.kelelahan / 5) * 0.15 +
    (user.lingkungan / 5) * 0.15 +
    (user.gangguan / 5) * 0.15
  );
}

function toNumericArray(user) {
  const skor = hitungSkor(user);

  return [
    Number(user.konsentrasi),
    Number(user.konsistensi),
    Number(user.durasi),
    Number(user.kelelahan),
    Number(user.lingkungan),
    Number(user.gangguan),
    ["sekolah", "kuliah", "bekerja"].indexOf(
      String(user.aktivitas).toLowerCase().trim(),
    ),
    skor,
  ];
}

// PREDIKSI AI
export function prediksiAI(user) {
  try {
    const input = [toNumericArray(user)];

    // safety
    if (!tree) {
      console.warn("Tree belum tersedia");
      return 0;
    }

    const result = tree.predict(input);

    return result[0];
  } catch (err) {
    console.error("Error prediksiAI:", err);
    return 0;
  }
}

// DECISION PATH (XAI)
export function getDecisionPath(sample) {
  try {
    let node = tree?.root;

    if (!node) {
      return ["Model belum siap (tree kosong)"];
    }

    const path = [];

    while (node && !node.isLeaf) {
      const idx = node.splitColumn;
      const thr = node.splitValue;
      const val = Number(sample[idx]);

      if (val <= thr) {
        path.push(`Fitur[${idx}] <= ${thr}`);
        node = node.left;
      } else {
        path.push(`Fitur[${idx}] > ${thr}`);
        node = node.right;
      }
    }

    if (node) {
      path.push(`→ Kode rekomendasi: ${node.classification}`);
    } else {
      path.push("Tidak dapat menelusuri decision tree");
    }

    return path;
  } catch (err) {
    console.error("Error getDecisionPath:", err);
    return ["Penjelasan AI tidak tersedia"];
  }
}

// FEATURE IMPORTANCE
export function getFeatureImportance() {
  try {
    const imp = {};

    function walk(n) {
      if (!n || n.isLeaf) return;

      imp[n.splitColumn] = (imp[n.splitColumn] || 0) + 1;

      walk(n.left);
      walk(n.right);
    }

    if (!tree?.root) {
      return {};
    }

    walk(tree.root);

    return imp;
  } catch (err) {
    console.error("Error featureImportance:", err);
    return {};
  }
}
